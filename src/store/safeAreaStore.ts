import { create } from "zustand";
import type { SafeAreaResult, OrientationMode } from "@/types/simulator";
import { SAFE_AREA_DEFAULTS } from "@/config/thresholds";

interface SafeAreaState {
  orientationMode: OrientationMode;
  gridSpacingM: number;
  result: SafeAreaResult | null;
  isCalculating: boolean;
  /** True once camera/lens/stage has changed since the last calculation (spec §10D). */
  isStale: boolean;

  setOrientationMode: (mode: OrientationMode) => void;
  setGridSpacingM: (spacing: number) => void;
  setResult: (result: SafeAreaResult) => void;
  setCalculating: (calculating: boolean) => void;
  markStale: () => void;
}

/**
 * Safe Shooting Area is deliberately NOT recomputed automatically on
 * every camera/lens change (spec §51: "disabled initially because
 * calculation is expensive"; §10D: mark STALE and prompt the user to
 * recalculate rather than silently recomputing). This store only holds
 * the last computed result plus a stale flag -- the actual (expensive)
 * computation is triggered explicitly by the UI calling
 * calculateSafeArea() and then setResult().
 */
export const useSafeAreaStore = create<SafeAreaState>((set) => ({
  orientationMode: "LOOK_AT_STAGE_CENTER",
  gridSpacingM: SAFE_AREA_DEFAULTS.gridSpacingM,
  result: null,
  isCalculating: false,
  isStale: false,

  setOrientationMode: (mode) => set({ orientationMode: mode, isStale: true }),
  setGridSpacingM: (spacing) => set({ gridSpacingM: spacing, isStale: true }),
  setResult: (result) => set({ result, isStale: false, isCalculating: false }),
  setCalculating: (calculating) => set({ isCalculating: calculating }),
  markStale: () => set({ isStale: true }),
}));
