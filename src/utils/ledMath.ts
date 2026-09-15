import { degToRad } from "./coordinates";
import type { StageConfig, StageDiagnostics, MainLEDConfig, PlatformConfig } from "@/types/stage";

/**
 * Main LED panel's bottom-edge Y coordinate, relative to the platform
 * surface (Y=0). Per user-supplied plan-drawing measurements, the panel
 * rests on a 0.06 m support member measured from the FACILITY FLOOR
 * (Y = -platform.height), which is shorter than the platform itself
 * (0.17 m) -- so the panel's physical bottom sits BELOW the platform
 * surface. Do not assume the LED bottom is at Y=0 elsewhere.
 */
export function calculateMainLEDBottomY(
  mainLED: Pick<MainLEDConfig, "supportMemberHeightM">,
  platform: Pick<PlatformConfig, "height">
): number {
  return mainLED.supportMemberHeightM - platform.height;
}


/**
 * calculatedArcLength = radius * radians(arcDegrees)
 *
 * This is a mathematical property of the DRAWING geometry radius and is
 * intentionally NOT forced to equal the published 30 m wall width.
 * See StageDiagnostics.
 */
export function calculateArcLength(radiusM: number, arcDegrees: number): number {
  return radiusM * degToRad(arcDegrees);
}

/**
 * Theoretical resolution derived from physical dimension / pixel pitch.
 * This is explicitly DIFFERENT from, and must never overwrite, the
 * published panel resolution (rounding + panel construction may differ).
 */
export function calculateResolutionFromPitch(
  widthM: number,
  heightM: number,
  pixelPitchMm: number
): { width: number; height: number } {
  const widthMm = widthM * 1000;
  const heightMm = heightM * 1000;
  return {
    width: Math.round(widthMm / pixelPitchMm),
    height: Math.round(heightMm / pixelPitchMm),
  };
}

/**
 * Builds the full Stage Diagnostics report (spec §31). Discrepancies
 * between published and calculated/derived figures are surfaced here,
 * never silently resolved.
 */
export function buildStageDiagnostics(stage: StageConfig): StageDiagnostics {
  const calculatedArcLength = calculateArcLength(
    stage.mainLED.radius,
    stage.mainLED.arcDegrees
  );

  const mainLEDCalculatedResolutionFromPitch = calculateResolutionFromPitch(
    stage.mainLED.publishedWallWidth,
    stage.mainLED.height,
    stage.mainLED.pixelPitchMm
  );

  const ceilingCalculatedResolutionFromPitch = calculateResolutionFromPitch(
    stage.ceilingLED.width,
    stage.ceilingLED.depth,
    stage.ceilingLED.pixelPitchMm
  );

  return {
    publishedWallWidth: stage.mainLED.publishedWallWidth,
    calculatedArcLength,
    arcLengthDifference: calculatedArcLength - stage.mainLED.publishedWallWidth,

    publishedNominalDiameter: stage.mainLED.publishedNominalDiameter,
    drawingReferenceDiameter: stage.mainLED.drawingReferenceDiameter,

    mainLEDPublishedResolution: stage.mainLED.publishedResolution,
    mainLEDCalculatedResolutionFromPitch,

    ceilingPublishedResolution: stage.ceilingLED.publishedResolution,
    ceilingCalculatedResolutionFromPitch,
  };
}
