import { useMemo } from "react";
import * as THREE from "three";
import type { MainLEDConfig } from "@/types/stage";
import { getArcAngleRange } from "@/utils/coordinates";

export type LEDDisplayMode = "wireframe" | "solid" | "textured";

interface LEDVolumeProps {
  config: MainLEDConfig;
  displayMode?: LEDDisplayMode;
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
  endRad: number
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
    const y = v * height;

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
}: LEDVolumeProps) {
  const { startRad, endRad } = useMemo(
    () => getArcAngleRange(config.arcDegrees, config.openingDirection),
    [config.arcDegrees, config.openingDirection]
  );

  const geometry = useMemo(
    () => buildMainLEDSurfaceGeometry(config.radius, config.height, startRad, endRad),
    [config.radius, config.height, startRad, endRad]
  );

  return (
    <mesh geometry={geometry} name="MainLEDVolume">
      <meshStandardMaterial
        color={displayMode === "wireframe" ? "#3b82f6" : "#1e3a5f"}
        side={THREE.DoubleSide}
        wireframe={displayMode === "wireframe"}
        emissive={displayMode === "solid" ? "#0f2744" : "#000000"}
        emissiveIntensity={0.4}
        roughness={0.6}
        metalness={0.1}
      />
    </mesh>
  );
}
