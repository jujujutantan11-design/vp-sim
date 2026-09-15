import { useMemo } from "react";
import * as THREE from "three";
import type { CeilingLEDConfig } from "@/types/stage";
import { buildSteppedCeilingShape } from "@/utils/ceilingShape";

interface CeilingLEDProps {
  config: CeilingLEDConfig;
  displayMode?: "wireframe" | "solid" | "textured" | "transparent";
}

/**
 * Ceiling LED. Faces downward (toward -Y), positioned at config.height
 * above the platform (Y=0), offset by centerX/centerZ.
 *
 * Footprint is a stepped/staircase-cornered shape (see
 * src/utils/ceilingShape.ts), matching the as-built plan drawing rather
 * than a plain rectangle -- the corner steps are a documented visual
 * approximation, not verified exact module dimensions; the 12m x 11m
 * bounding box remains the authoritative published size.
 */
export function CeilingLED({ config, displayMode = "solid" }: CeilingLEDProps) {
  const geometry = useMemo(() => {
    const shape = buildSteppedCeilingShape(config.width, config.depth);
    return new THREE.ShapeGeometry(shape);
  }, [config.width, config.depth]);

  if (!config.enabled) return null;

  return (
    <mesh
      name="CeilingLED"
      geometry={geometry}
      position={[config.centerX, config.height, config.centerZ]}
      rotation={[Math.PI / 2, 0, 0]} // rotate plane to face downward (-Y)
    >
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
