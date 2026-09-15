import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { CeilingLEDConfig } from "@/types/stage";
import { buildSteppedCeilingShape } from "@/utils/ceilingShape";
import { useImageTexture } from "./useImageTexture";
import { computeFitTransform } from "@/utils/textureFit";
import type { FitMode } from "@/store/textureStore";

interface CeilingLEDProps {
  config: CeilingLEDConfig;
  displayMode?: "wireframe" | "solid" | "textured" | "transparent";
  imageUrl?: string | null;
  fitMode?: FitMode;
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
export function CeilingLED({ config, displayMode = "solid", imageUrl = null, fitMode = "FILL" }: CeilingLEDProps) {
  const geometry = useMemo(() => {
    const shape = buildSteppedCeilingShape(config.width, config.depth);
    // THREE.ShapeGeometry auto-generates UVs from the shape's own
    // bounding box, already normalized 0..1 -- reusable directly for
    // the same fit-transform logic as the Main LED.
    return new THREE.ShapeGeometry(shape);
  }, [config.width, config.depth]);

  const texture = useImageTexture(imageUrl);

  useEffect(() => {
    if (!texture) return;
    const surfaceAspect = config.width / config.depth;
    const imageAspect = (texture.image?.width ?? 1) / (texture.image?.height ?? 1);
    const t = computeFitTransform(fitMode, imageAspect, surfaceAspect);
    texture.repeat.set(t.repeatX, t.repeatY);
    texture.offset.set(t.offsetX, t.offsetY);
    texture.needsUpdate = true;
  }, [texture, fitMode, config.width, config.depth]);

  if (!config.enabled) return null;

  return (
    <mesh
      name="CeilingLED"
      geometry={geometry}
      position={[config.centerX, config.height, config.centerZ]}
      rotation={[Math.PI / 2, 0, 0]} // rotate plane to face downward (-Y)
    >
      <meshStandardMaterial
        color={texture ? "#ffffff" : "#4a3f1e"}
        map={texture ?? undefined}
        side={THREE.DoubleSide}
        wireframe={displayMode === "wireframe"}
        transparent={displayMode === "transparent"}
        opacity={displayMode === "transparent" ? 0.35 : 1}
        emissive={texture ? "#ffffff" : "#2a2410"}
        emissiveMap={texture ?? undefined}
        emissiveIntensity={texture ? 1 : 0.3}
        roughness={0.6}
      />
    </mesh>
  );
}
