import { useMemo } from "react";
import * as THREE from "three";
import { useCameraStore, getActiveSensorDimensions } from "@/store/cameraStore";
import { CAMERA_PRESETS } from "@/config/cameras";
import { calculateFOV, buildSimulatedCamera } from "@/utils/cameraMath";
import type { FOVResult } from "@/utils/cameraMath";

export interface SimulatedCameraResult {
  camera: THREE.PerspectiveCamera;
  fov: FOVResult;
  sensorWidthMm: number;
  sensorHeightMm: number;
  sensorAspect: number;
  cameraName: string;
  sensorModeName: string;
}


/**
 * Single source of truth for the simulated cinema camera's projection.
 * Frustum visualization (Phase 2), the camera monitor (Phase 2), and the
 * ray/LED coverage engine (Phase 3) must all consume this same object /
 * the same FOV numbers -- never recompute FOV independently elsewhere.
 */
export function useSimulatedCamera(): SimulatedCameraResult {
  const camera = useCameraStore((s) => s.camera);
  const lens = useCameraStore((s) => s.lens);

  return useMemo(() => {
    const { widthMm, heightMm } = getActiveSensorDimensions(camera);
    const fov = calculateFOV(widthMm, heightMm, lens.focalLengthMm);
    const sensorAspect = widthMm / heightMm;

    const threeCamera = buildSimulatedCamera({
      positionX: camera.positionX,
      positionY: camera.positionY,
      positionZ: camera.positionZ,
      panDeg: camera.pan,
      tiltDeg: camera.tilt,
      rollDeg: camera.roll,
      vfovDeg: fov.vfovDeg,
      aspect: sensorAspect,
      near: camera.nearClip,
      far: camera.farClip,
    });

    const preset = CAMERA_PRESETS[camera.cameraPresetId];
    const mode = preset?.sensorModes.find((m) => m.id === camera.sensorModeId);

    return {
      camera: threeCamera,
      fov,
      sensorWidthMm: widthMm,
      sensorHeightMm: heightMm,
      sensorAspect,
      cameraName: camera.name,
      sensorModeName: mode?.name ?? "Custom",
    };
  }, [camera, lens]);
}
