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
