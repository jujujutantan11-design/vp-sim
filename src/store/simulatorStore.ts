import { create } from "zustand";
import type { StageConfig } from "@/types/stage";
import { STAGE_PRESETS, DEFAULT_STAGE_PRESET_ID } from "@/config/stages";

export type ViewMode = "PERSPECTIVE" | "TOP" | "FRONT" | "SIDE" | "CAMERA";
export type TransformMode = "translate" | "rotate";
export type CoverageOverlayMode = "OFF" | "STATUS" | "HEATMAP";

/**
 * Phase 1 store slice: stage configuration + view mode only.
 *
 * Camera state, lens state, and analysis state are intentionally NOT
 * included yet (Phase 2/3/4) -- they will be added as separate slices to
 * avoid unrelated Three.js re-renders (spec §39).
 */
interface SimulatorState {
  stagePresetId: string;
  stage: StageConfig;
  viewMode: ViewMode;
  showSafetyZone: boolean;
  showAxes: boolean;
  isTransformDragging: boolean;
  transformMode: TransformMode;
  coverageOverlayMode: CoverageOverlayMode;

  setStagePreset: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleSafetyZone: () => void;
  toggleCeilingEnabled: () => void;
  setCeilingHeight: (heightM: number) => void;
  setTransformDragging: (dragging: boolean) => void;
  setTransformMode: (mode: TransformMode) => void;
  setCoverageOverlayMode: (mode: CoverageOverlayMode) => void;
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  stagePresetId: DEFAULT_STAGE_PRESET_ID,
  stage: STAGE_PRESETS[DEFAULT_STAGE_PRESET_ID],
  viewMode: "PERSPECTIVE",
  showSafetyZone: STAGE_PRESETS[DEFAULT_STAGE_PRESET_ID].safetyZone.show,
  showAxes: true,
  isTransformDragging: false,
  transformMode: "translate",
  coverageOverlayMode: "STATUS",

  setStagePreset: (id) => {
    const preset = STAGE_PRESETS[id];
    if (!preset) return;
    set({ stagePresetId: id, stage: preset, showSafetyZone: preset.safetyZone.show });
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleSafetyZone: () => set({ showSafetyZone: !get().showSafetyZone }),

  toggleCeilingEnabled: () =>
    set((state) => ({
      stage: {
        ...state.stage,
        ceilingLED: {
          ...state.stage.ceilingLED,
          enabled: !state.stage.ceilingLED.enabled,
        },
      },
    })),

  setCeilingHeight: (heightM) =>
    set((state) => ({
      stage: {
        ...state.stage,
        ceilingLED: {
          ...state.stage.ceilingLED,
          height: heightM,
        },
      },
    })),

  setTransformDragging: (dragging) => set({ isTransformDragging: dragging }),
  setTransformMode: (mode) => set({ transformMode: mode }),
  setCoverageOverlayMode: (mode) => set({ coverageOverlayMode: mode }),
}));
