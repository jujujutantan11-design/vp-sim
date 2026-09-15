import { useEffect, useRef } from "react";
import * as THREE from "three";
import { TransformControls } from "@react-three/drei";
import { useCameraStore } from "@/store/cameraStore";
import { useSimulatorStore } from "@/store/simulatorStore";

interface CameraTransformControlsProps {
  mode: "translate" | "rotate";
}

/**
 * Drives the SIMULATED cinema camera's position/pan/tilt/roll via an
 * invisible proxy Object3D manipulated by drei's TransformControls.
 *
 * Per spec §13/§34: OrbitControls (the editor camera) must NEVER be
 * changed by this, and this must NEVER change the editor camera --
 * they operate on completely independent objects. We do, however,
 * temporarily disable OrbitControls while dragging so the two controls
 * don't fight over pointer input (see simulatorStore.isTransformDragging,
 * consumed by StageView's <OrbitControls enabled={...}>).
 */
export function CameraTransformControls({ mode }: CameraTransformControlsProps) {
  const proxyRef = useRef<THREE.Group>(null);
  const camera = useCameraStore((s) => s.camera);
  const setPosition = useCameraStore((s) => s.setPosition);
  const setPan = useCameraStore((s) => s.setPan);
  const setTilt = useCameraStore((s) => s.setTilt);
  const setRoll = useCameraStore((s) => s.setRoll);
  const setTransformDragging = useSimulatorStore((s) => s.setTransformDragging);

  // Keep the proxy synced when the store changes from elsewhere (numeric inputs).
  useEffect(() => {
    const obj = proxyRef.current;
    if (!obj) return;
    obj.position.set(camera.positionX, camera.positionY, camera.positionZ);
    const euler = new THREE.Euler(
      (camera.tilt * Math.PI) / 180,
      (camera.pan * Math.PI) / 180,
      (camera.roll * Math.PI) / 180,
      "YXZ"
    );
    obj.quaternion.setFromEuler(euler);
  }, [camera.positionX, camera.positionY, camera.positionZ, camera.pan, camera.tilt, camera.roll]);

  function handleObjectChange() {
    const obj = proxyRef.current;
    if (!obj) return;
    setPosition(obj.position.x, obj.position.y, obj.position.z);
    const euler = new THREE.Euler().setFromQuaternion(obj.quaternion, "YXZ");
    setPan((euler.y * 180) / Math.PI);
    setTilt((euler.x * 180) / Math.PI);
    setRoll((euler.z * 180) / Math.PI);
  }

  // IMPORTANT: drei's <TransformControls> wraps its `children` in its
  // OWN internal group and attaches the gizmo to THAT wrapper -- not to
  // whatever ref you put on the child. Nesting `proxyRef` as a child
  // (the earlier, buggy version of this component) meant dragging moved
  // drei's internal wrapper while `proxyRef`'s own local transform never
  // changed, so onObjectChange kept reading stale values. Passing the
  // ref via the `object` prop and rendering the proxy as a SIBLING
  // attaches the gizmo directly to our own object instead.
  return (
    <>
      <group ref={proxyRef} />
      <TransformControls
        object={proxyRef}
        mode={mode}
        onObjectChange={handleObjectChange}
        onMouseDown={() => setTransformDragging(true)}
        onMouseUp={() => setTransformDragging(false)}
      />
    </>
  );
}
