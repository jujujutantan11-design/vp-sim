import * as THREE from "three";
import type { StageConfig } from "@/types/stage";
import type {
  SafeAreaCell,
  SafeAreaResult,
  OrientationMode,
  MovementMargin,
} from "@/types/simulator";
import { sampleCoverage } from "./coverage";
import { calculateSafetyAtPosition } from "./safety";
import { panTiltRollToQuaternion } from "./cameraMath";
import { SAFE_AREA_DEFAULTS } from "@/config/thresholds";

export interface SafeAreaParams {
  stage: StageConfig;
  cameraHeightM: number;
  /** Current camera pan/tilt/roll, used verbatim when orientationMode is FIXED_ORIENTATION. */
  fixedPanDeg: number;
  fixedTiltDeg: number;
  fixedRollDeg: number;
  orientationMode: OrientationMode;
  hfovRad: number;
  vfovRad: number;
  aspect: number;
  gridSpacingM?: number;
}

/**
 * Evaluates a 2D X/Z grid at a fixed camera height (spec §23), running a
 * reduced-resolution coverage sample (spec §25) plus a safety-distance
 * check at each candidate position, and classifying each cell
 * SAFE / WARNING / UNSAFE.
 *
 * This is synchronous and can take a noticeable amount of time for fine
 * grid spacings -- callers should show a "CALCULATING..." state (spec
 * §25) and trigger this explicitly (e.g. a button), never on every
 * camera-store change, since it's far more expensive than the per-frame
 * coverage sample.
 */
export function calculateSafeArea(params: SafeAreaParams): SafeAreaResult {
  const t0 = performance.now();
  const {
    stage,
    cameraHeightM,
    fixedPanDeg,
    fixedTiltDeg,
    fixedRollDeg,
    orientationMode,
    hfovRad,
    vfovRad,
    aspect,
    gridSpacingM = SAFE_AREA_DEFAULTS.gridSpacingM,
  } = params;

  const extentM = stage.mainLED.radius + SAFE_AREA_DEFAULTS.gridExtentPaddingM;
  const { width: covW, height: covH } = SAFE_AREA_DEFAULTS.coverageSamplingGrid;
  const target = SAFE_AREA_DEFAULTS.defaultLookAtTarget;

  const cells: SafeAreaCell[] = [];

  for (let z = -extentM; z <= extentM; z += gridSpacingM) {
    for (let x = -extentM; x <= extentM; x += gridSpacingM) {
      const position = new THREE.Vector3(x, cameraHeightM, z);

      const cam = new THREE.PerspectiveCamera((vfovRad * 180) / Math.PI, aspect, 0.05, 100);
      cam.position.copy(position);

      if (orientationMode === "LOOK_AT_STAGE_CENTER") {
        cam.lookAt(target.x, target.y, target.z);
      } else {
        cam.quaternion.copy(panTiltRollToQuaternion(fixedPanDeg, fixedTiltDeg, fixedRollDeg));
      }
      cam.updateMatrixWorld(true);
      cam.updateProjectionMatrix();

      const coverage = sampleCoverage(cam, hfovRad, vfovRad, stage, covW, covH);
      const safety = calculateSafetyAtPosition(position, stage);

      let status: SafeAreaCell["status"];
      if (coverage.shootingStatus === "VIOLATION" || safety.status === "VIOLATION") {
        status = "UNSAFE";
      } else if (coverage.shootingStatus === "WARNING" || safety.status === "WARNING") {
        status = "WARNING";
      } else {
        status = "SAFE";
      }

      cells.push({ x, z, status });
    }
  }

  return {
    cells,
    gridSpacingM,
    cameraHeightM,
    orientationMode,
    computeTimeMs: performance.now() - t0,
    extentM,
  };
}

/**
 * Approximate camera movement margin (spec §26): from the current
 * camera (x0, z0), how far can it move along each of four directions
 * (relative to its current facing direction, projected onto the XZ
 * plane) before leaving SAFE status, using the already-computed Safe
 * Area grid. Steps in gridSpacingM increments and stops at the first
 * non-SAFE cell or the edge of the evaluated area.
 */
export function calculateMovementMargin(
  safeArea: SafeAreaResult,
  currentX: number,
  currentZ: number,
  facingPanDeg: number
): MovementMargin {
  const spacing = safeArea.gridSpacingM;

  // Build a quick lookup by rounding to the grid.
  const key = (x: number, z: number) => `${Math.round(x / spacing)}_${Math.round(z / spacing)}`;
  const lookup = new Map<string, SafeAreaCell["status"]>();
  for (const cell of safeArea.cells) {
    lookup.set(key(cell.x, cell.z), cell.status);
  }

  const panRad = (facingPanDeg * Math.PI) / 180;
  // Forward direction (matches panTiltRollToQuaternion's pan=0 => -Z convention).
  const forward = { x: Math.sin(panRad), z: -Math.cos(panRad) };
  const right = { x: Math.cos(panRad), z: Math.sin(panRad) };

  function marginAlong(dirX: number, dirZ: number): number {
    let distance = 0;
    for (let step = 1; step <= Math.ceil((safeArea.extentM * 2) / spacing); step++) {
      const testX = currentX + dirX * spacing * step;
      const testZ = currentZ + dirZ * spacing * step;
      if (Math.abs(testX) > safeArea.extentM || Math.abs(testZ) > safeArea.extentM) break;
      const status = lookup.get(key(testX, testZ));
      if (status === undefined || status !== "SAFE") break;
      distance = spacing * step;
    }
    return distance;
  }

  return {
    forwardM: marginAlong(forward.x, forward.z),
    backwardM: marginAlong(-forward.x, -forward.z),
    leftM: marginAlong(-right.x, -right.z),
    rightM: marginAlong(right.x, right.z),
  };
}
