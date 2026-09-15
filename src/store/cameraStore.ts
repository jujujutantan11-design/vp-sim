import { create } from "zustand";
import type { CameraConfig, LensConfig } from "@/types/camera";
import {
  CAMERA_PRESETS,
  DEFAULT_CAMERA_PRESET_ID,
  DEFAULT_SENSOR_MODE_ID,
} from "@/config/cameras";
import { DEFAULT_LENS_SERIES_ID, DEFAULT_FOCAL_LENGTH_MM } from "@/config/lenses";

/**
 * Camera + lens state slice, deliberately separate from stage/view state
 * (spec §39) so that adjusting camera position doesn't force unrelated
 * re-renders of stage geometry, and vice versa.
 *
 * Initial camera position/orientation per spec §51: X=0, Y=1.5, Z=0,
 * pointing toward the middle of the Main LED opposite the opening
 * (i.e. toward -Z, since the opening faces +Z) -- pan=180 achieves this
 * given panTiltRollToQuaternion's pan=0 => looks toward -Z convention...
 * Actually pan=0 already looks toward -Z, which IS "opposite the +Z
 * opening" (toward the LED wall). So pan=0 is correct as the initial
 * value; no rotation needed.
 */
interface CameraState {
  camera: CameraConfig;
  lens: LensConfig;

  toeiEquipmentOnly: boolean;

  setCameraPreset: (presetId: string) => void;
  setSensorMode: (sensorModeId: string) => void;
  setCustomSensor: (widthMm: number, heightMm: number) => void;

  setPosition: (x: number, y: number, z: number) => void;
  setPan: (deg: number) => void;
  setTilt: (deg: number) => void;
  setRoll: (deg: number) => void;

  setLensSeries: (lensSeriesId: string) => void;
  setFocalLength: (mm: number) => void;

  toggleToeiEquipmentOnly: () => void;
}

export const useCameraStore = create<CameraState>((set, get) => ({
  camera: {
    cameraPresetId: DEFAULT_CAMERA_PRESET_ID,
    sensorModeId: DEFAULT_SENSOR_MODE_ID,
    name: "ARRI ALEXA 35",
    positionX: 0,
    positionY: 1.5,
    positionZ: 0,
    pan: 0,
    tilt: 0,
    roll: 0,
    nearClip: 0.05,
    farClip: 100,
  },
  lens: {
    lensSeriesId: DEFAULT_LENS_SERIES_ID,
    focalLengthMm: DEFAULT_FOCAL_LENGTH_MM,
  },

  toeiEquipmentOnly: false,

  setCameraPreset: (presetId) => {
    const preset = CAMERA_PRESETS[presetId];
    if (!preset) return;
    set((state) => ({
      camera: {
        ...state.camera,
        cameraPresetId: presetId,
        sensorModeId: preset.sensorModes[0].id,
      },
    }));
  },

  setSensorMode: (sensorModeId) =>
    set((state) => ({ camera: { ...state.camera, sensorModeId } })),

  setCustomSensor: (widthMm, heightMm) =>
    set((state) => ({
      camera: { ...state.camera, customSensor: { widthMm, heightMm } },
    })),

  setPosition: (x, y, z) =>
    set((state) => ({
      camera: { ...state.camera, positionX: x, positionY: y, positionZ: z },
    })),

  setPan: (deg) => set((state) => ({ camera: { ...state.camera, pan: deg } })),
  setTilt: (deg) => set((state) => ({ camera: { ...state.camera, tilt: deg } })),
  setRoll: (deg) => set((state) => ({ camera: { ...state.camera, roll: deg } })),

  setLensSeries: (lensSeriesId) =>
    set((state) => ({ lens: { ...state.lens, lensSeriesId } })),

  setFocalLength: (mm) => set((state) => ({ lens: { ...state.lens, focalLengthMm: mm } })),

  toggleToeiEquipmentOnly: () => set({ toeiEquipmentOnly: !get().toeiEquipmentOnly }),
}));

/**
 * Resolves the CURRENT active sensor mode's active dimensions, honoring
 * the CUSTOM camera override. This is the single place FOV-consuming
 * code should pull sensor dimensions from.
 */
export function getActiveSensorDimensions(camera: CameraConfig): {
  widthMm: number;
  heightMm: number;
} {
  if (camera.cameraPresetId === "CUSTOM" && camera.customSensor) {
    return { widthMm: camera.customSensor.widthMm, heightMm: camera.customSensor.heightMm };
  }
  const preset = CAMERA_PRESETS[camera.cameraPresetId];
  const mode = preset?.sensorModes.find((m) => m.id === camera.sensorModeId) ?? preset?.sensorModes[0];
  return { widthMm: mode?.activeWidthMm ?? 24.9, heightMm: mode?.activeHeightMm ?? 14.0 };
}
