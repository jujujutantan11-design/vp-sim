import { useMemo } from "react";
import { useSimulatorStore } from "@/store/simulatorStore";
import { useCameraStore } from "@/store/cameraStore";
import { calculateSafetyAtPosition } from "@/utils/safety";
import type { SafetyResult } from "@/types/simulator";

/**
 * Single source of truth for the current camera's safety-zone distance
 * and status (spec §22, §4). Consumed by the ANALYSIS panel and the
 * SafetyZone visualization -- never recomputed ad-hoc elsewhere.
 */
export function useSafety(): SafetyResult {
  const stage = useSimulatorStore((s) => s.stage);
  const camera = useCameraStore((s) => s.camera);

  return useMemo(
    () => calculateSafetyAtPosition({ x: camera.positionX, y: camera.positionY, z: camera.positionZ }, stage),
    [stage, camera.positionX, camera.positionY, camera.positionZ]
  );
}
