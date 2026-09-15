import type { CameraPreset } from "@/types/camera";
import { ARRI_ALEXA_35 } from "./arriAlexa35";

/**
 * CUSTOM CAMERA: user-editable sensorWidth/sensorHeight, per spec §10.
 * Represented as a single-sensor-mode preset whose dimensions are
 * overridden at runtime by CameraConfig.customSensor.
 */
export const CUSTOM_CAMERA: CameraPreset = {
  id: "CUSTOM",
  manufacturer: "User Defined",
  model: "Custom Camera",
  sensorModes: [
    {
      id: "CUSTOM_SENSOR",
      name: "Custom Sensor",
      activeWidthMm: 24.9,
      activeHeightMm: 14.0,
      resolutionWidth: 4096,
      resolutionHeight: 2304,
      aspectRatio: 4096 / 2304,
      verified: false,
      source: "USER_DEFINED",
    },
  ],
};

export const CAMERA_PRESETS: Record<string, CameraPreset> = {
  ARRI_ALEXA_35: ARRI_ALEXA_35,
  CUSTOM: CUSTOM_CAMERA,
};

export const DEFAULT_CAMERA_PRESET_ID = "ARRI_ALEXA_35";
export const DEFAULT_SENSOR_MODE_ID = "OPEN_GATE_4_6K_3_2";

export { ARRI_ALEXA_35 };
