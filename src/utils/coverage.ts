import * as THREE from "three";
import type { StageConfig } from "@/types/stage";
import type { CoverageResult, FrameEdgeStatus, ShootingStatus, SurfaceClassification } from "@/types/simulator";
import { castRay } from "./intersections";
import { calculateMainLEDBottomY } from "./ledMath";
import { COVERAGE_THRESHOLDS } from "@/config/thresholds";

/**
 * Samples the simulated cinema camera's image plane on a regular grid
 * (spec §16), casting one ray per sample and classifying it as
 * MAIN_LED / CEILING_LED / OUTSIDE_LED via the analytic intersection
 * engine (src/utils/intersections.ts). This is the single coverage
 * computation used by both the numeric ANALYSIS panel and the
 * CAMERA VIEW overlay -- never recompute coverage independently
 * elsewhere.
 *
 * Per-sample ray directions are derived from the camera's actual
 * horizontal/vertical FOV (half-angles), NOT from the camera's
 * projection matrix directly, since we want directions in WORLD space;
 * this still uses the exact same FOV numbers the frustum/monitor use
 * (see useSimulatedCamera), so it stays consistent with them by
 * construction.
 */
export function sampleCoverage(
  camera: THREE.PerspectiveCamera,
  hfovRad: number,
  vfovRad: number,
  stage: StageConfig,
  gridWidth: number = COVERAGE_THRESHOLDS.fullQualitySamplingGrid.width,
  gridHeight: number = COVERAGE_THRESHOLDS.fullQualitySamplingGrid.height
): CoverageResult {
  const t0 = performance.now();

  const origin = camera.position.clone();
  const quaternion = camera.quaternion.clone();

  const halfW = Math.tan(hfovRad / 2);
  const halfH = Math.tan(vfovRad / 2);

  const mainLEDBottomY = calculateMainLEDBottomY(stage.mainLED, stage.platform);

  const samples: SurfaceClassification[] = new Array(gridWidth * gridHeight);

  let mainLEDHits = 0;
  let ceilingHits = 0;
  let outsideHits = 0;

  for (let j = 0; j < gridHeight; j++) {
    // v in [-1, 1], +1 = top of frame
    const v = 1 - (2 * (j + 0.5)) / gridHeight;
    for (let i = 0; i < gridWidth; i++) {
      // u in [-1, 1], +1 = right of frame
      const u = (2 * (i + 0.5)) / gridWidth - 1;

      const localDir = new THREE.Vector3(u * halfW, v * halfH, -1).normalize();
      const worldDir = localDir.applyQuaternion(quaternion);

      const result = castRay(origin, worldDir, stage.mainLED, stage.ceilingLED, mainLEDBottomY);

      const idx = j * gridWidth + i;
      samples[idx] = result.surface;

      if (result.surface === "MAIN_LED") mainLEDHits++;
      else if (result.surface === "CEILING_LED") ceilingHits++;
      else outsideHits++;
    }
  }

  const totalSamples = gridWidth * gridHeight;
  const mainLEDPercent = (mainLEDHits / totalSamples) * 100;
  const ceilingPercent = (ceilingHits / totalSamples) * 100;
  const outsidePercent = (outsideHits / totalSamples) * 100;

  const edges = calculateFrameEdges(samples, gridWidth, gridHeight);
  const shootingStatus = calculateShootingStatus(outsidePercent, edges);

  const computeTimeMs = performance.now() - t0;

  return {
    gridWidth,
    gridHeight,
    totalSamples,
    mainLEDHits,
    ceilingHits,
    outsideHits,
    mainLEDPercent,
    ceilingPercent,
    outsidePercent,
    edges,
    shootingStatus,
    samples,
    computeTimeMs,
  };
}

/**
 * Frame edge analysis (spec §20): even a small OUTSIDE_LED percentage
 * can be critical if it's concentrated at a frame edge, so edges are
 * reported separately from the overall percentage.
 */
export function calculateFrameEdges(
  samples: SurfaceClassification[],
  gridWidth: number,
  gridHeight: number
): FrameEdgeStatus {
  const hasOutsideInRow = (j: number) => {
    for (let i = 0; i < gridWidth; i++) {
      if (samples[j * gridWidth + i] === "OUTSIDE_LED") return true;
    }
    return false;
  };
  const hasOutsideInCol = (i: number) => {
    for (let j = 0; j < gridHeight; j++) {
      if (samples[j * gridWidth + i] === "OUTSIDE_LED") return true;
    }
    return false;
  };

  return {
    top: hasOutsideInRow(0) ? "WARNING" : "OK",
    bottom: hasOutsideInRow(gridHeight - 1) ? "WARNING" : "OK",
    left: hasOutsideInCol(0) ? "WARNING" : "OK",
    right: hasOutsideInCol(gridWidth - 1) ? "WARNING" : "OK",
  };
}

/**
 * Overall shooting status (spec §21). Thresholds are centralized in
 * src/config/thresholds.ts, never hard-coded here.
 */
export function calculateShootingStatus(outsidePercent: number, edges: FrameEdgeStatus): ShootingStatus {
  const anyEdgeWarning =
    edges.top === "WARNING" || edges.bottom === "WARNING" || edges.left === "WARNING" || edges.right === "WARNING";

  if (outsidePercent <= COVERAGE_THRESHOLDS.safeOutsideLedPercentMax && !anyEdgeWarning) {
    return "SAFE";
  }
  if (outsidePercent >= COVERAGE_THRESHOLDS.violationOutsideLedPercentMin) {
    return "VIOLATION";
  }
  return "WARNING";
}
