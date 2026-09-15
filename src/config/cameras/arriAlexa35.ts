import type { CameraPreset } from "@/types/camera";

/**
 * ARRI ALEXA 35 sensor modes.
 *
 * Values below are MANUFACTURER_VERIFIED, sourced from ARRI's own
 * published technical specifications (arri.com), NOT from the TOEI
 * No.11st facility documentation. The TOEI documentation only confirms
 * that an ALEXA 35 is available/calibrated for the stage -- it does not
 * itself specify sensor dimensions (spec §10).
 *
 * Source: ARRI ALEXA 35 official technical specification sheet
 * (https://www.arri.com/en/camera-systems/cameras/alexa-35),
 * cross-checked against ARRI press materials, retrieved 2026.
 */
const ARRI_SOURCE = "ARRI ALEXA 35 official technical specification (arri.com)";

export const ARRI_ALEXA_35: CameraPreset = {
  id: "ARRI_ALEXA_35",
  manufacturer: "ARRI",
  model: "ALEXA 35",
  sensorModes: [
    {
      id: "OPEN_GATE_4_6K_3_2",
      name: "4.6K 3:2 Open Gate",
      activeWidthMm: 28.0,
      activeHeightMm: 19.2,
      resolutionWidth: 4608,
      resolutionHeight: 3164,
      aspectRatio: 4608 / 3164,
      verified: true,
      source: ARRI_SOURCE,
    },
    {
      id: "4_6K_16_9",
      name: "4.6K 16:9",
      activeWidthMm: 28.0,
      activeHeightMm: 15.7,
      resolutionWidth: 4608,
      resolutionHeight: 2592,
      aspectRatio: 4608 / 2592,
      verified: true,
      source: ARRI_SOURCE,
    },
    {
      id: "4K_16_9",
      name: "4K 16:9",
      activeWidthMm: 24.9,
      activeHeightMm: 14.0,
      resolutionWidth: 4096,
      resolutionHeight: 2304,
      aspectRatio: 4096 / 2304,
      verified: true,
      source: ARRI_SOURCE,
    },
    {
      id: "4K_2_1",
      name: "4K 2:1",
      activeWidthMm: 24.9,
      activeHeightMm: 12.4,
      resolutionWidth: 4096,
      resolutionHeight: 2048,
      aspectRatio: 4096 / 2048,
      verified: true,
      source: ARRI_SOURCE,
    },
    {
      id: "3_3K_6_5",
      name: "3.3K 6:5 (anamorphic)",
      activeWidthMm: 20.22,
      activeHeightMm: 16.95,
      resolutionWidth: 3328,
      resolutionHeight: 2790,
      aspectRatio: 3328 / 2790,
      notes: "Anamorphic de-squeeze recording mode.",
      verified: true,
      source: ARRI_SOURCE,
    },
    {
      id: "3K_1_1",
      name: "3K 1:1 (anamorphic)",
      activeWidthMm: 18.7,
      activeHeightMm: 18.7,
      resolutionWidth: 3072,
      resolutionHeight: 3072,
      aspectRatio: 1,
      notes: "Anamorphic de-squeeze recording mode.",
      verified: true,
      source: ARRI_SOURCE,
    },
    {
      id: "2K_16_9_S16",
      name: "2K 16:9 S16",
      activeWidthMm: 12.4,
      activeHeightMm: 7.0,
      resolutionWidth: 2048,
      resolutionHeight: 1152,
      aspectRatio: 2048 / 1152,
      verified: true,
      source: ARRI_SOURCE,
    },
  ],
};
