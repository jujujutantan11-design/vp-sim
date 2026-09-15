/**
 * Stage geometry types.
 *
 * COORDINATE SYSTEM (see src/utils/coordinates.ts for full documentation):
 *   Units: meters
 *   X = stage left/right
 *   Y = vertical, positive = up
 *   Z = stage front/back
 *   Origin (0,0,0) = center of the Main LED circle, at platform surface level.
 *   Platform surface: Y = 0
 *   Facility floor:   Y = -platformHeight
 *   Main LED bottom:  Y = 0
 *   Main LED top:     Y = mainLED.height
 */

/** Distinguishes where a numeric value ultimately came from, per spec §10O / §31. */
export type DataSourceClassification =
  | "TOEI_DOCUMENTED"
  | "MANUFACTURER_VERIFIED"
  | "USER_DEFINED"
  | "UNVERIFIED";

/**
 * Main curved LED wall.
 *
 * IMPORTANT (spec §3, §7): TOEI facility documentation states TWO different
 * diameter figures which are NOT identical:
 *   - publishedNominalDiameter (~12.0 m)  -- facility spec sheet, rounded
 *   - drawingReferenceDiameter (12.636 m) -- detailed plan drawing (Φ12,636mm)
 *
 * The simulator's actual rendered/computed geometry uses `radius`, which is
 * derived from `drawingReferenceDiameter` by default (geometryMode =
 * "DRAWING_DIAMETER"). Both source values are preserved and never silently
 * reconciled -- see StageDiagnostics.
 */
export interface MainLEDConfig {
  /** Which source diameter currently drives the rendered geometry radius. */
  geometryMode: "DRAWING_DIAMETER" | "PUBLISHED_WALL_LENGTH";

  /** Geometric radius actually used for rendering & math, in meters. */
  radius: number;

  /** Wall height, meters. Published: 5.0 m. */
  height: number;

  /** Arc angle of the wall, degrees. Published: 270. */
  arcDegrees: number;

  /**
   * Direction the missing (open) 90-degree section faces, as a unit-vector
   * label. Default "+Z" per spec §5. This is the single configurable
   * parameter controlling wall orientation -- do not hard-code the opening
   * direction elsewhere.
   */
  openingDirection: "+Z" | "-Z" | "+X" | "-X";

  /** Published facility spec sheet figure, meters. Reference only. */
  publishedNominalDiameter: number;

  /** Detailed plan drawing figure (Φ12,636mm), meters. Reference only. */
  drawingReferenceDiameter: number;

  /** Published wall width along the arc, meters. Published: 30.0 m. */
  publishedWallWidth: number;

  /** Panel/product name, e.g. "AOTO RM1.5" */
  panelProduct: string;

  /** Pixel pitch, millimeters. */
  pixelPitchMm: number;

  /** Published resolution -- never overwritten by calculated values. */
  publishedResolution: { width: number; height: number };

  refreshRateHz: number;
  brightnessNit: number;
  contrastRatio: string;
  weightTon: number;

  source: DataSourceClassification;
}

/** Rectangular, vertically-adjustable ceiling LED. */
export interface CeilingLEDConfig {
  enabled: boolean;

  /** meters */
  width: number;
  /** meters */
  depth: number;

  /** Height above platform (Y=0), meters. Editable. Published max ~5.1 m above platform. */
  height: number;

  /** Center offset from stage origin, meters. */
  centerX: number;
  centerZ: number;

  publishedMaxHeightAboveFloor: number; // ~5.2 m from facility floor reference
  publishedMaxHeightAbovePlatform: number; // ~5.1 m

  panelProduct: string;
  pixelPitchMm: number;
  publishedResolution: { width: number; height: number };

  refreshRateHz: number;
  brightnessNit: number;
  contrastRatio: string;
  weightTon: number;

  source: DataSourceClassification;
}

export interface PlatformConfig {
  /** meters, permanent platform height above facility floor. Published ~170mm. */
  height: number;
}

export interface SafetyZoneConfig {
  /** meters. Minimum distance from LED panels people/equipment must maintain. */
  distance: number;
  show: boolean;
}

/** Top-level stage preset. TOEI No.11st is one preset among possible future stages. */
export interface StageConfig {
  id: "TOEI_NO11" | "CUSTOM_STAGE" | "OTHER_STAGE";
  name: string;
  subtitle: string;

  mainLED: MainLEDConfig;
  ceilingLED: CeilingLEDConfig;
  platform: PlatformConfig;
  safetyZone: SafetyZoneConfig;

  /** Reference-only figures from source documentation, not used in geometry. */
  reference: {
    publishedStageAreaTsubo: number;
    publishedStageAreaSqm: number;
    entireStageAreaSqm: number;
    entireStageAreaTsubo: number;
    planDrawingScale: string;
  };
}

/**
 * Discrepancies between published spec-sheet figures and geometrically
 * derived/drawing figures. Per spec §31 these must be DISPLAYED, never
 * silently resolved.
 */
export interface StageDiagnostics {
  publishedWallWidth: number;
  calculatedArcLength: number;
  arcLengthDifference: number;

  publishedNominalDiameter: number;
  drawingReferenceDiameter: number;

  mainLEDPublishedResolution: { width: number; height: number };
  mainLEDCalculatedResolutionFromPitch: { width: number; height: number };

  ceilingPublishedResolution: { width: number; height: number };
  ceilingCalculatedResolutionFromPitch: { width: number; height: number };
}
