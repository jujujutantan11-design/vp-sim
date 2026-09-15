import { useMemo } from "react";
import { useSimulatorStore } from "@/store/simulatorStore";
import { useSimulatedCamera } from "@/components/camera/useSimulatedCamera";
import { sampleCoverage } from "@/utils/coverage";
import { COVERAGE_THRESHOLDS } from "@/config/thresholds";
import type { CoverageResult } from "@/types/simulator";

/**
 * Single source of truth for LED coverage (spec §16-21). Recomputes
 * whenever stage geometry, camera position/orientation/sensor, or lens
 * focal length change. Uses the reduced "drag" sampling grid while a
 * TransformControls drag is in progress (spec §41 perf guidance), full
 * quality otherwise.
 */
export function useCoverage(): CoverageResult {
  const stage = useSimulatorStore((s) => s.stage);
  const isDragging = useSimulatorStore((s) => s.isTransformDragging);
  const { camera, fov } = useSimulatedCamera();

  return useMemo(() => {
    const grid = isDragging
      ? COVERAGE_THRESHOLDS.dragSamplingGrid
      : COVERAGE_THRESHOLDS.fullQualitySamplingGrid;
    return sampleCoverage(camera, fov.hfovRad, fov.vfovRad, stage, grid.width, grid.height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, fov, stage, isDragging]);
}
