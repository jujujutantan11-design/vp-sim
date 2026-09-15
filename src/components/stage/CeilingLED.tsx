import * as THREE from "three";
import type { CeilingLEDConfig } from "@/types/stage";

interface CeilingLEDProps {
  config: CeilingLEDConfig;
  displayMode?: "wireframe" | "solid" | "textured" | "transparent";
}

/**
 * Rectangular ceiling LED. Faces downward (toward -Y), positioned at
 * config.height above the platform (Y=0), offset by centerX/centerZ.
 */
export function CeilingLED({ config, displayMode = "solid" }: CeilingLEDProps) {
  if (!config.enabled) return null;

  return (
    <mesh
      name="CeilingLED"
      position={[config.centerX, config.height, config.centerZ]}
      rotation={[Math.PI / 2, 0, 0]} // rotate plane to face downward (-Y)
    >
      <planeGeometry args={[config.width, config.depth]} />
      <meshStandardMaterial
        color="#4a3f1e"
        side={THREE.DoubleSide}
        wireframe={displayMode === "wireframe"}
        transparent={displayMode === "transparent"}
        opacity={displayMode === "transparent" ? 0.35 : 1}
        emissive="#2a2410"
        emissiveIntensity={0.3}
        roughness={0.6}
      />
    </mesh>
  );
}
