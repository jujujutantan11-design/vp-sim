import { useEffect, useMemo, useRef } from "react";
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
 *
 * IMPORTANT: useSimulatedCamera creates a brand-new THREE.PerspectiveCamera
 * on essentially every relevant store change -- including every single
 * frame of a TransformControls drag. That means a brand-new
 * THREE.CameraHelper (with its own GPU-side geometry/material) was
 * previously being created dozens of times per second while dragging,
 * with the PREVIOUS helper's geometry/material never disposed --
 * a serious GPU memory leak over an extended session that can
 * eventually exhaust GPU memory and crash the WebGL context
 * ("Context Lost"), even for later, unrelated, tiny allocations.
 * The cleanup below disposes the old helper's geometry/material
 * whenever a new one is created (or the component unmounts).
 */
export function CameraFrustum() {
  const { camera } = useSimulatedCamera();

  const helper = useMemo(() => new THREE.CameraHelper(camera), [camera]);
  const prevHelperRef = useRef<THREE.CameraHelper | null>(null);

  useEffect(() => {
    if (prevHelperRef.current && prevHelperRef.current !== helper) {
      prevHelperRef.current.geometry.dispose();
      (prevHelperRef.current.material as THREE.Material).dispose();
    }
    prevHelperRef.current = helper;
    return () => {
      if (prevHelperRef.current === helper) {
        helper.geometry.dispose();
        (helper.material as THREE.Material).dispose();
      }
    };
  }, [helper]);

  useEffect(() => {
    helper.update();
  });

  return <primitive object={helper} />;
}
