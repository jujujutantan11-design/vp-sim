import * as THREE from "three";
import type { StageConfig, MainLEDConfig } from "@/types/stage";
import type { SafetyResult } from "@/types/simulator";
import { getArcAngleRange, normalizeAngle, xzToTheta, isAngleWithinLEDArc } from "./coordinates";
import { calculateMainLEDBottomY } from "./ledMath";
import { SAFETY_THRESHOLDS } from "@/config/thresholds";

/**
 * Distance from a horizontal position (x, z) to the Main LED's
 * cylindrical surface, properly respecting the 270-degree angular
 * boundary (spec §22 -- "a proper nearest-surface utility", not a naive
 * `R - rCamera` that ignores the opening).
 *
 * Two cases:
 *  1. The position's angle (theta) lies WITHIN the LED arc: the nearest
 *     point is straight out along the radius, distance = R - rCamera
 *     (camera assumed inside the cylinder, the normal case; clamped to
 *     >= 0 if slightly outside due to input error).
 *  2. The position's angle lies WITHIN the opening (no LED there): the
 *     nearest LED material is at one of the two arc boundary edges --
 *     computed as the nearest point on either boundary's vertical edge
 *     line (at radius R, angle = startRad or endRad), i.e. ordinary 2D
 *     point-to-point distance in the XZ plane (since edges are vertical
 *     lines, height doesn't change the horizontal nearest point).
 */
export function horizontalDistanceToMainLED(x: number, z: number, mainLED: MainLEDConfig): number {
  const rCamera = Math.sqrt(x * x + z * z);
  const theta = xzToTheta(x, z);

  if (isAngleWithinLEDArc(theta, mainLED.arcDegrees, mainLED.openingDirection)) {
    return Math.max(0, mainLED.radius - rCamera);
  }

  // Outside the arc (in the opening): nearest point is one of the two
  // boundary edges of the arc, each a vertical line at (R*sin(a), R*cos(a)).
  const { startRad, endRad } = getArcAngleRange(mainLED.arcDegrees, mainLED.openingDirection);
  const edgeAngles = [startRad, endRad];
  let minDist = Infinity;
  for (const a of edgeAngles) {
    const ex = mainLED.radius * Math.sin(a);
    const ez = mainLED.radius * Math.cos(a);
    const d = Math.hypot(x - ex, z - ez);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

/**
 * Vertical distance from a camera Y position to the Ceiling LED, only
 * meaningful when the camera is horizontally within the ceiling's
 * footprint and below it. Returns Infinity when not applicable (no
 * ceiling constraint from that position).
 */
export function distanceToCeiling(
  x: number,
  y: number,
  z: number,
  stage: StageConfig
): number {
  const { ceilingLED } = stage;
  if (!ceilingLED.enabled) return Infinity;
  if (y >= ceilingLED.height) return Infinity;
  if (Math.abs(x - ceilingLED.centerX) > ceilingLED.width / 2) return Infinity;
  if (Math.abs(z - ceilingLED.centerZ) > ceilingLED.depth / 2) return Infinity;
  return ceilingLED.height - y;
}

/**
 * Full safety evaluation for a given world position: nearest distance
 * to ANY LED surface (main wall or ceiling), and the resulting
 * SAFE/WARNING/VIOLATION status against stage.safetyZone.distance
 * (hard boundary) plus a configurable warning margin
 * (SAFETY_THRESHOLDS.warningMarginM).
 */
export function calculateSafetyAtPosition(
  position: THREE.Vector3 | { x: number; y: number; z: number },
  stage: StageConfig
): SafetyResult {
  const wallDistance = horizontalDistanceToMainLED(position.x, position.z, stage.mainLED);
  const ceilingDistance = distanceToCeiling(position.x, position.y, position.z, stage);
  const nearestDistance = Math.min(wallDistance, ceilingDistance);

  const hardBoundary = stage.safetyZone.distance;
  const warningBoundary = hardBoundary + SAFETY_THRESHOLDS.warningMarginM;

  const status: SafetyResult["status"] =
    nearestDistance < hardBoundary ? "VIOLATION" : nearestDistance < warningBoundary ? "WARNING" : "SAFE";

  return { nearestDistance, wallDistance, ceilingDistance, status };
}

/** Re-exported for callers that only need the bottom-Y helper alongside safety math. */
export { calculateMainLEDBottomY, normalizeAngle };
