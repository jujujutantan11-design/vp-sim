import * as THREE from "three";
import type { MainLEDConfig, CeilingLEDConfig } from "@/types/stage";
import type { RayIntersectionResult } from "@/types/simulator";
import { getArcAngleRange, isAngleWithinLEDArc, xzToTheta } from "./coordinates";
import { COVERAGE_THRESHOLDS } from "@/config/thresholds";

const EPS = COVERAGE_THRESHOLDS.epsilon;

/**
 * Analytic ray/cylinder intersection against the Main LED's cylindrical
 * surface (spec §17).
 *
 * Ray: P(t) = O + t*D  (t >= 0 only -- never count intersections behind
 * the camera)
 * Cylinder: x^2 + z^2 = R^2
 *
 * Solve the quadratic:
 *   (Dx^2 + Dz^2) t^2 + 2(Ox*Dx + Oz*Dz) t + (Ox^2 + Oz^2 - R^2) = 0
 *
 * After finding the smallest positive valid t, the hit point is further
 * validated against:
 *   - the vertical extent [bottomY, bottomY + height]
 *   - the 270-degree angular range (excludes the opening sector)
 *
 * origin/direction are in world space (meters); direction need not be
 * normalized (t is still a valid distance parameter, but callers wanting
 * true world-space distances should pass a normalized direction).
 */
export function intersectRayWithMainLED(
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  mainLED: MainLEDConfig,
  bottomY: number
): RayIntersectionResult {
  const miss: RayIntersectionResult = { hit: false, surface: "OUTSIDE_LED", distance: Infinity, point: null };

  const R = mainLED.radius;
  const Ox = origin.x;
  const Oz = origin.z;
  const Dx = direction.x;
  const Dz = direction.z;

  const a = Dx * Dx + Dz * Dz;

  // Ray parallel to the cylinder's axis (purely vertical): no side-wall
  // intersection is possible (except the degenerate case of running
  // exactly along the surface, which we do not treat as a hit).
  if (a < EPS) return miss;

  const b = 2 * (Ox * Dx + Oz * Dz);
  const c = Ox * Ox + Oz * Oz - R * R;

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return miss; // ray misses the infinite cylinder entirely

  const sqrtDisc = Math.sqrt(discriminant);
  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);

  // Try the two roots in increasing order; use the first that is
  // positive (in front of the camera) AND passes the Y-range / angular
  // checks. (A ray starting inside the cylinder, the normal case here
  // since the camera sits inside the LED volume, has exactly one
  // positive root -- the far one, t2 -- but we check both generically
  // so the function is correct even for a camera outside the cylinder.)
  const candidates = t1 <= t2 ? [t1, t2] : [t2, t1];

  for (const t of candidates) {
    if (t < EPS) continue; // behind or at the camera

    const x = Ox + t * Dx;
    const z = Oz + t * Dz;
    const y = origin.y + t * direction.y;

    if (y < bottomY - EPS || y > bottomY + mainLED.height + EPS) continue;

    const theta = xzToTheta(x, z);
    if (!isAngleWithinLEDArc(theta, mainLED.arcDegrees, mainLED.openingDirection)) continue;

    return {
      hit: true,
      surface: "MAIN_LED",
      distance: t,
      point: [x, y, z],
    };
  }

  return miss;
}

/**
 * Ray/plane intersection against the (finite, rectangular) Ceiling LED
 * (spec §18). The ceiling is treated as a horizontal plane at
 * Y = ceilingLED.height, clipped to its width/depth extent.
 */
export function intersectRayWithCeiling(
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  ceilingLED: CeilingLEDConfig
): RayIntersectionResult {
  const miss: RayIntersectionResult = { hit: false, surface: "OUTSIDE_LED", distance: Infinity, point: null };

  if (!ceilingLED.enabled) return miss;
  if (Math.abs(direction.y) < EPS) return miss; // ray parallel to the ceiling plane

  const t = (ceilingLED.height - origin.y) / direction.y;
  if (t < EPS) return miss; // behind the camera, or the ceiling is behind given the ray direction

  const x = origin.x + t * direction.x;
  const z = origin.z + t * direction.z;

  if (Math.abs(x - ceilingLED.centerX) > ceilingLED.width / 2 + EPS) return miss;
  if (Math.abs(z - ceilingLED.centerZ) > ceilingLED.depth / 2 + EPS) return miss;

  return {
    hit: true,
    surface: "CEILING_LED",
    distance: t,
    point: [x, origin.y + t * direction.y, z],
  };
}

/**
 * Casts a single ray against both LED surfaces and returns the nearest
 * valid hit, or an OUTSIDE_LED miss if neither surface is hit. This is
 * the single entry point the coverage sampler (Phase 3) and any future
 * consumer should use -- never call the two intersection functions
 * ad-hoc elsewhere.
 */
export function castRay(
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  mainLED: MainLEDConfig,
  ceilingLED: CeilingLEDConfig,
  mainLEDBottomY: number
): RayIntersectionResult {
  const mainHit = intersectRayWithMainLED(origin, direction, mainLED, mainLEDBottomY);
  const ceilingHit = intersectRayWithCeiling(origin, direction, ceilingLED);

  if (mainHit.hit && ceilingHit.hit) {
    return mainHit.distance <= ceilingHit.distance ? mainHit : ceilingHit;
  }
  if (mainHit.hit) return mainHit;
  if (ceilingHit.hit) return ceilingHit;

  return { hit: false, surface: "OUTSIDE_LED", distance: Infinity, point: null };
}

/** Re-exported for tests / diagnostics that want the raw arc boundary. */
export { getArcAngleRange };
