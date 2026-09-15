import { useSimulatedCamera } from "./useSimulatedCamera";

/**
 * Simple visual marker for the simulated camera body position/orientation
 * in the editor (Stage) view. This is purely decorative -- it does not
 * participate in any FOV or coverage calculation (those all read from
 * useSimulatedCamera's THREE.PerspectiveCamera directly).
 */
export function CameraModel() {
  const { camera } = useSimulatedCamera();

  return (
    <group position={camera.position} quaternion={camera.quaternion}>
      <mesh>
        <boxGeometry args={[0.2, 0.18, 0.32]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>
      {/* Lens barrel, pointing toward camera -Z (forward) */}
      <mesh position={[0, 0, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.12, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}
