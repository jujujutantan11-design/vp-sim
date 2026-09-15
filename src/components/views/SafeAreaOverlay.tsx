import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { SafeAreaResult } from "@/types/simulator";

interface SafeAreaOverlayProps {
  result: SafeAreaResult | null;
}

const STATUS_COLOR: Record<string, [number, number, number]> = {
  SAFE: [0.13, 0.77, 0.37], // green
  WARNING: [0.96, 0.62, 0.04], // amber
  UNSAFE: [0.94, 0.27, 0.27], // red
};

/**
 * Renders the Safe Shooting Area grid (spec §23) as a single merged,
 * per-vertex-colored mesh (one small quad per cell) for performance --
 * a grid can have 1,000+ cells, so one <mesh> per cell would be far too
 * many draw calls.
 */
export function SafeAreaOverlay({ result }: SafeAreaOverlayProps) {
  const geometry = useMemo(() => {
    if (!result) return null;

    const half = result.gridSpacingM / 2;
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    let vertexIndex = 0;
    for (const cell of result.cells) {
      const [r, g, b] = STATUS_COLOR[cell.status] ?? STATUS_COLOR.UNSAFE;

      // Quad corners (Y=0 plane; positioned slightly above the platform
      // surface by the consuming <mesh>'s own Y offset).
      positions.push(
        cell.x - half, 0, cell.z - half,
        cell.x + half, 0, cell.z - half,
        cell.x - half, 0, cell.z + half,
        cell.x + half, 0, cell.z + half
      );
      for (let k = 0; k < 4; k++) colors.push(r, g, b);

      indices.push(
        vertexIndex, vertexIndex + 1, vertexIndex + 2,
        vertexIndex + 1, vertexIndex + 3, vertexIndex + 2
      );
      vertexIndex += 4;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    return geo;
  }, [result]);

  // Dispose the previous grid geometry's GPU buffers whenever a new
  // calculation replaces it (or on unmount).
  useEffect(() => {
    return () => geometry?.dispose();
  }, [geometry]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} position={[0, 0.01, 0]} name="SafeAreaOverlay">
      <meshBasicMaterial vertexColors transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}
