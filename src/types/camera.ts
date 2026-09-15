import type { DataSourceClassification } from "./stage";

/**
 * A single selectable recording/sensor mode on a camera body.
 * FOV MUST always be calculated from activeWidthMm/activeHeightMm --
 * never from resolution alone (spec §10B).
 */
export interface SensorMode {
  id: string;
  name: string;

  activeWidthMm: number;
  activeHeightMm: number;

  resolutionWidth: number;
  resolutionHeight: number;

  aspectRatio: number;

  notes?: string;
  verified: boolean;
  source: string;
}

export interface CameraPreset {
  id: string;
  manufacturer: string;
  model: string;
  sensorModes: SensorMode[];
}

export interface LensSeries {
  id: string;
  manufacturer: string;
  series: string;
  type: "PRIME" | "ZOOM";
  mount?: string;

  /** For PRIME series: the focal lengths in the database (not necessarily all physically at TOEI). */
  focalLengths?: number[];

  /** For ZOOM series. */
  zoomRange?: { min: number; max: number };

  metadata?: {
    minimumFocus?: number;
    maximumAperture?: string;
    imageCircle?: number;
  };

  /** Focal lengths (for PRIME) confirmed present at TOEI No.11st specifically. */
  toeiAvailableFocalLengths?: number[];

  verified: boolean;
  source: string;
}

/** Live simulated cinema camera configuration (Phase 2 store slice). */
export interface CameraConfig {
  cameraPresetId: string;
  sensorModeId: string;

  /** Custom camera override, used when cameraPresetId === "CUSTOM". */
  customSensor?: { widthMm: number; heightMm: number };

  name: string;

  positionX: number;
  positionY: number;
  positionZ: number;

  /** degrees */
  pan: number;
  /** degrees */
  tilt: number;
  /** degrees */
  roll: number;

  nearClip: number;
  farClip: number;
}

export interface LensConfig {
  lensSeriesId: string;
  focalLengthMm: number;
}
