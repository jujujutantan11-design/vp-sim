export type SurfaceClassification = "MAIN_LED" | "CEILING_LED" | "OUTSIDE_LED";

export interface RayIntersectionResult {
  hit: boolean;
  surface: SurfaceClassification;
  distance: number;
  point: [number, number, number] | null;
}

export interface FrameEdgeStatus {
  top: "OK" | "WARNING";
  bottom: "OK" | "WARNING";
  left: "OK" | "WARNING";
  right: "OK" | "WARNING";
}

export type ShootingStatus = "SAFE" | "WARNING" | "VIOLATION";

export interface CoverageResult {
  gridWidth: number;
  gridHeight: number;
  totalSamples: number;

  mainLEDHits: number;
  ceilingHits: number;
  outsideHits: number;

  mainLEDPercent: number;
  ceilingPercent: number;
  outsidePercent: number;

  edges: FrameEdgeStatus;
  shootingStatus: ShootingStatus;

  /** Per-sample classification grid, row-major, for overlay rendering. */
  samples: SurfaceClassification[];

  computeTimeMs: number;
}

/** Safety-zone evaluation for a single world position (spec §22). */
export interface SafetyResult {
  nearestDistance: number;
  wallDistance: number;
  ceilingDistance: number;
  status: ShootingStatus;
}

export type SafeAreaCellStatus = "SAFE" | "WARNING" | "UNSAFE";

export interface SafeAreaCell {
  x: number;
  z: number;
  status: SafeAreaCellStatus;
}

export type OrientationMode = "FIXED_ORIENTATION" | "LOOK_AT_STAGE_CENTER";

export interface SafeAreaResult {
  cells: SafeAreaCell[];
  gridSpacingM: number;
  cameraHeightM: number;
  orientationMode: OrientationMode;
  computeTimeMs: number;
  /** Half-extent (meters) of the square area evaluated, centered on the origin. */
  extentM: number;
}

export interface MovementMargin {
  forwardM: number;
  backwardM: number;
  leftM: number;
  rightM: number;
}

