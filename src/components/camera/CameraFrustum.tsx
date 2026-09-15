import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useSimulatedCamera } from "./useSimulatedCamera";

/**
 * Visualizes the simulated cinema camera's frustum using
 * THREE.CameraHelper, which derives its lines directly from the
 * camera's actual projection matrix (near plane, far direction, four
 * edges) -- not an arbitrary/approximated pyramid (spec §14).
 *
 * Must update immediately whenever focal length, sensor size, position,
 * or orientation change; since useSimulatedCamera rebuilds the camera
 * object on every relevant store change, and CameraHelper.update()
 * re-reads that camera's current matrices each time, this stays in
 * sync automatically.
 */
export function CameraFrustum() {
  const { camera } = useSimulatedCamera();

  const helper = useMemo(() => new THREE.CameraHelper(camera), [camera]);

  useEffect(() => {
    helper.update();
  });

  return <primitive object={helper} />;
}
