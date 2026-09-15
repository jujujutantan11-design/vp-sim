import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { MainLEDConfig, SafetyZoneConfig } from "@/types/stage";
import { getArcAngleRange } from "@/utils/coordinates";
import { useSafety } from "@/components/camera/useSafety";

interface SafetyZoneProps {
  mainLED: MainLEDConfig;
  safetyZone: SafetyZoneConfig;
  /**
   * Explicit visibility flag, sourced from simulatorStore.showSafetyZone
   * (the toggle in the STAGE panel) -- NOT safetyZone.show, which is
   * only the stage preset's initial/default value. Keeping these
   * separate previously caused the toggle button to have no visible
   * effect; this prop is the single source of truth for whether the
   * visualization renders.
   */
  show: boolean;
}

const STATUS_COLOR = {
  SAFE: "#22c55e",
  WARNING: "#f59e0b",
  VIOLATION: "#ef4444",
} as const;

/**
 * Visualizes the 1m (configurable) safety exclusion boundary as a
 * translucent ring on the floor at radius = mainLED.radius -
 * safetyZone.distance, following the same 270-degree arc as the Main
 * LED itself (the exclusion zone only exists in front of LED panels).
 * Colored by the CURRENT camera's safety status (spec §4: SAFE=green,
 * WARNING=yellow/orange, VIOLATION=red).
 *
 * Per spec §4, this only visualizes the boundary -- it never prevents
 * camera movement.
 */
export function SafetyZone({ mainLED, safetyZone, show }: SafetyZoneProps) {
  const safety = useSafety();

  const boundaryRadius = mainLED.radius - safetyZone.distance;

  const geometry = useMemo(() => {
    const { startRad, endRad } = getArcAngleRange(mainLED.arcDegrees, mainLED.openingDirection);
    let angularSpan = endRad - startRad;
    if (angularSpan <= 0) angularSpan += Math.PI * 2;

    // Ring geometry following the same arc, built directly (not
    // THREE.RingGeometry, which only supports full circles / simple
    // theta ranges around a different convention) to stay consistent
    // with the x=R sin(theta), z=R cos(theta) parameterization used
    // throughout the app.
    const segments = 128;
    const innerR = boundaryRadius - 0.08;
    const outerR = boundaryRadius + 0.08;
    const positions: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const theta = startRad + (i / segments) * angularSpan;
      const sx = Math.sin(theta);
      const cz = Math.cos(theta);
      positions.push(innerR * sx, 0, innerR * cz);
      positions.push(outerR * sx, 0, outerR * cz);
    }
    for (let i = 0; i < segments; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, b, c, b, d, c);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [mainLED.arcDegrees, mainLED.openingDirection, boundaryRadius]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  if (!show) return null;

  return (
    <mesh geometry={geometry} position={[0, 0.015, 0]} name="SafetyZone">
      <meshBasicMaterial
        color={STATUS_COLOR[safety.status]}
        transparent
        opacity={0.55}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
