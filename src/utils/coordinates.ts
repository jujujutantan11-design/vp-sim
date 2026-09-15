/**
 * WORLD COORDINATE SYSTEM (authoritative definition -- spec §5)
 * ----------------------------------------------------------------
 * Units: meters everywhere in this module and in all world-space math.
 * (Millimeters are used ONLY for LED pixel pitch and camera sensor
 * dimensions, and are converted to meters at the boundary where needed.)
 *
 * Three.js right-handed convention:
 *   X = stage left / right
 *   Y = vertical, +Y = up
 *   Z = stage front / back
 *
 * Origin (0, 0, 0) = center of the Main LED circle, at platform surface
 * level.
 *
 *   Facility floor   : Y = -platformHeight   (≈ -0.17 m)
 *   Platform surface : Y = 0
 *   Main LED bottom  : Y = 0
 *   Main LED top     : Y = mainLED.height    (5.0 m)
 *
 * The 270° Main LED arc surrounds the origin. The missing 90° section
 * (the "opening") faces `openingDirection`, default +Z.
 *
 * Angular parameterization of the Main LED cylindrical surface:
 *   x = R * sin(theta)
 *   z = R * cos(theta)
 *   y = vertical position (independent of theta)
 *
 * theta = 0 points toward +Z. The arc is defined as the 270° range that
 * EXCLUDES the 90° sector centered on `openingDirection`. See
 * `getArcAngleRange` below for the exact start/end angles this produces
 * for each opening direction. These bounds are the single source of
 * truth for both rendering (LEDVolume.tsx) and coverage math
 * (intersections.ts, Phase 3) -- do not redefine them elsewhere.
 */

export type OpeningDirection = "+Z" | "-Z" | "+X" | "-X";

/** Radians per degree, exported to avoid magic numbers elsewhere. */
export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

export function degToRad(deg: number): number {
  return deg * DEG2RAD;
}

export function radToDeg(rad: number): number {
  return rad * RAD2DEG;
}

/**
 * Returns the [startAngle, endAngle] of the LED arc in radians, measured
 * from +Z axis, increasing toward +X (matching x = R sin(theta), z = R
 * cos(theta)). The arc spans `arcDegrees` (e.g. 270) and is centered
 * opposite the opening direction.
 *
 * Example: openingDirection = "+Z" (theta = 0 is the center of the
 * missing 90 degree section) => LED material spans
 * theta in [45deg, 315deg] (going the long way around, i.e. NOT through 0).
 */
export function getArcAngleRange(
  arcDegrees: number,
  openingDirection: OpeningDirection
): { startRad: number; endRad: number; openingCenterRad: number } {
  const openingCenterDeg: Record<OpeningDirection, number> = {
    "+Z": 0,
    "+X": 90,
    "-Z": 180,
    "-X": 270,
  };
  const openingCenter = openingCenterDeg[openingDirection];
  const openingHalfWidth = (360 - arcDegrees) / 2;

  // LED material starts just past the end of the opening and wraps
  // around (the long way) back to just before the opening starts again.
  const startDeg = openingCenter + openingHalfWidth;
  const endDeg = openingCenter + 360 - openingHalfWidth;

  return {
    startRad: degToRad(startDeg),
    endRad: degToRad(endDeg),
    openingCenterRad: degToRad(openingCenter),
  };
}

/**
 * Normalizes an angle (radians) into [0, 2*PI).
 */
export function normalizeAngle(theta: number): number {
  const twoPi = Math.PI * 2;
  let t = theta % twoPi;
  if (t < 0) t += twoPi;
  return t;
}

/**
 * Returns true if `theta` (radians, will be normalized) lies within the
 * LED material arc (i.e. NOT within the opening sector), for the given
 * arc configuration.
 */
export function isAngleWithinLEDArc(
  theta: number,
  arcDegrees: number,
  openingDirection: OpeningDirection
): boolean {
  const { startRad, endRad } = getArcAngleRange(arcDegrees, openingDirection);
  const t = normalizeAngle(theta);
  const start = normalizeAngle(startRad);
  const end = normalizeAngle(endRad);

  if (start <= end) {
    return t >= start && t <= end;
  }
  // Wraps across 0/2PI
  return t >= start || t <= end;
}

/** Converts a world-space (x, z) into the theta convention used above. */
export function xzToTheta(x: number, z: number): number {
  // matches x = R sin(theta), z = R cos(theta) => theta = atan2(x, z)
  return normalizeAngle(Math.atan2(x, z));
}
