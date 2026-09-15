import { create } from "zustand";

export type FitMode = "FIT" | "FILL" | "STRETCH";

interface TextureState {
  mainLEDImageDataUrl: string | null;
  mainLEDFitMode: FitMode;
  ceilingLEDImageDataUrl: string | null;
  ceilingLEDFitMode: FitMode;

  setMainLEDImage: (dataUrl: string | null) => void;
  setMainLEDFitMode: (mode: FitMode) => void;
  setCeilingLEDImage: (dataUrl: string | null) => void;
  setCeilingLEDFitMode: (mode: FitMode) => void;
}

/**
 * LED content textures (spec §28). Phase 1 only -- static images
 * (PNG/JPEG/WebP), no video. Stored as data URLs (this is a
 * browser-only app with no backend), which is fine for MVP file sizes
 * but not intended for huge source images.
 */
export const useTextureStore = create<TextureState>((set) => ({
  mainLEDImageDataUrl: null,
  mainLEDFitMode: "FILL",
  ceilingLEDImageDataUrl: null,
  ceilingLEDFitMode: "FILL",

  setMainLEDImage: (dataUrl) => set({ mainLEDImageDataUrl: dataUrl }),
  setMainLEDFitMode: (mode) => set({ mainLEDFitMode: mode }),
  setCeilingLEDImage: (dataUrl) => set({ ceilingLEDImageDataUrl: dataUrl }),
  setCeilingLEDFitMode: (mode) => set({ ceilingLEDFitMode: mode }),
}));
