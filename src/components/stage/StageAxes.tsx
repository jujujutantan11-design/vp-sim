import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";
import type { OpeningDirection } from "@/utils/coordinates";

interface StageAxesProps {
  size?: number;
  openingDirection: OpeningDirection;
}

const OPENING_VECTOR: Record<OpeningDirection, [number, number, number]> = {
  "+Z": [0, 0, 1],
  "-Z": [0, 0, -1],
  "+X": [1, 0, 0],
  "-X": [-1, 0, 0],
};

/**
 * Visual documentation of the world coordinate system: X (red), Y
 * (green), Z (blue) axes at the origin, plus a label marking the LED
 * arc's opening direction so the 270-degree orientation is never
 * ambiguous when inspecting the scene.
 */
export function StageAxes({ size = 3, openingDirection }: StageAxesProps) {
  const axes = useMemo(() => new THREE.AxesHelper(size), [size]);
  const openingPos = OPENING_VECTOR[openingDirection].map((v) => v * (size + 2)) as [
    number,
    number,
    number
  ];

  return (
    <group name="StageAxes">
      <primitive object={axes} />
      <Html position={openingPos} center distanceFactor={15}>
        <div className="rounded bg-vp-panel/90 border border-vp-border px-2 py-1 text-[10px] text-neutral-300 whitespace-nowrap">
          OPENING ({openingDirection})
        </div>
      </Html>
      <Html position={[size + 0.5, 0, 0]} center distanceFactor={15}>
        <div className="text-[10px] text-red-400">X</div>
      </Html>
      <Html position={[0, size + 0.5, 0]} center distanceFactor={15}>
        <div className="text-[10px] text-green-400">Y (up)</div>
      </Html>
      <Html position={[0, 0, size + 0.5]} center distanceFactor={15}>
        <div className="text-[10px] text-blue-400">Z</div>
      </Html>
    </group>
  );
}
