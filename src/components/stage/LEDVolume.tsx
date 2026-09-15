import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { MainLEDConfig } from "@/types/stage";
import { getArcAngleRange } from "@/utils/coordinates";
import { useImageTexture } from "./useImageTexture";
import { computeFitTransform } from "@/utils/textureFit";
import type { FitMode } from "@/store/textureStore";
import { calculateArcLength } from "@/utils/ledMath";

export type LEDDisplayMode = "wireframe" | "solid" | "textured";

interface LEDVolumeProps {
  config: MainLEDConfig;
  displayMode?: LEDDisplayMode;
  /**
   * Y coordinate (relative to platform surface, Y=0) of the panel's
   * physical bottom edge. Defaults to 0 for backward compatibility, but
   * callers should pass `calculateMainLEDBottomY(stage.mainLED,
   * stage.platform)` from src/utils/ledMath.ts so the panel is
   * positioned per the actual support-member measurement rather than
   * assumed to start exactly at the platform surface.
   */
  bottomY?: number;
  /** Content image (data URL) to map onto the wall's U/V (spec §28). */
  imageUrl?: string | null;
  fitMode?: FitMode;
  /** Purely decorative visualization thickness in meters. NOT used for any coverage math. */
  visualThicknessM?: number;
}

const ANGULAR_SEGMENTS = 256; // spec §6: angularSegments >= 256
const VERTICAL_SEGMENTS = 1; // spec §6: verticalSegments >= 1

/**
 * Deliberately constructed cylindrical LED surface.
 *
 * Parameterization (must match src/utils/coordinates.ts exactly, since
 * the coverage engine in Phase 3 uses the same convention):
 *   x = R * sin(theta)
 *   z = R * cos(theta)
 *   y = vertical position
 *
 * The surface faces INWARD (toward the stage center / -radial direction).
 * We do NOT use THREE.CylinderGeometry's built-in theta handling, to
 * avoid relying on its undocumented orientation and to guarantee this
 * parameterization is exactly what the ray-intersection math (Phase 3)
 * assumes.
 */
function buildMainLEDSurfaceGeometry(
  radius: number,
  height: number,
  startRad: number,
  endRad: number,
  bottomY: number
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  // endRad may be > startRad + 2*PI-ish wrap; compute angular span directly.
  let angularSpan = endRad - startRad;
  if (angularSpan <= 0) angularSpan += Math.PI * 2;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iv = 0; iv <= VERTICAL_SEGMENTS; iv++) {
    const v = iv / VERTICAL_SEGMENTS;
    const y = bottomY + v * height;

    for (let ia = 0; ia <= ANGULAR_SEGMENTS; ia++) {
      const u = ia / ANGULAR_SEGMENTS;
      const theta = startRad + u * angularSpan;

      const x = radius * Math.sin(theta);
      const z = radius * Math.cos(theta);

      positions.push(x, y, z);

      // Inward-facing normal: points from the wall surface toward the
      // cylinder axis, i.e. the negative of the outward radial direction.
      const nx = -Math.sin(theta);
      const nz = -Math.cos(theta);
      normals.push(nx, 0, nz);

      // U = position along the wall (0..1), V = vertical position (0..1)
      uvs.push(u, v);
    }
  }

  const rowLength = ANGULAR_SEGMENTS + 1;
  for (let iv = 0; iv < VERTICAL_SEGMENTS; iv++) {
    for (let ia = 0; ia < ANGULAR_SEGMENTS; ia++) {
      const a = iv * rowLength + ia;
      const b = a + rowLength;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  return geometry;
}

export function LEDVolume({
  config,
  displayMode = "solid",
  bottomY = 0,
  imageUrl = null,
  fitMode = "FILL",
}: LEDVolumeProps) {
  const { startRad, endRad } = useMemo(
    () => getArcAngleRange(config.arcDegrees, config.openingDirection),
    [config.arcDegrees, config.openingDirection]
  );

  const geometry = useMemo(
    () => buildMainLEDSurfaceGeometry(config.radius, config.height, startRad, endRad, bottomY),
    [config.radius, config.height, startRad, endRad, bottomY]
  );

  // Dispose the previous geometry's GPU buffers whenever a new one
  // replaces it (or on unmount) -- see useImageTexture.ts for why this
  // matters over an extended session.
  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  const texture = useImageTexture(imageUrl);

  useEffect(() => {
    if (!texture) return;
    const surfaceAspect = calculateArcLength(config.radius, config.arcDegrees) / config.height;
    const imageAspect = (texture.image?.width ?? 1) / (texture.image?.height ?? 1);
    const t = computeFitTransform(fitMode, imageAspect, surfaceAspect);
    texture.repeat.set(t.repeatX, t.repeatY);
    texture.offset.set(t.offsetX, t.offsetY);
    texture.needsUpdate = true;
  }, [texture, fitMode, config.radius, config.arcDegrees, config.height]);

  return (
    <mesh geometry={geometry} name="MainLEDVolume">
      <meshStandardMaterial
        color={texture ? "#000000" : displayMode === "wireframe" ? "#3b82f6" : "#1e3a5f"}
        side={THREE.DoubleSide}
        wireframe={displayMode === "wireframe"}
        emissive={texture ? "#ffffff" : displayMode === "solid" ? "#0f2744" : "#000000"}
        emissiveMap={texture ?? undefined}
        emissiveIntensity={texture ? 1 : 0.4}
        roughness={0.6}
        metalness={0.1}
      />
    </mesh>
  );
}
