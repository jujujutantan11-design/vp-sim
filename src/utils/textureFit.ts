import type { FitMode } from "@/store/textureStore";

export interface UVTransform {
  repeatX: number;
  repeatY: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Computes texture repeat/offset for a given fit mode (spec §28).
 *
 * STRETCH: image mapped 1:1 onto the surface, ignoring aspect ratio.
 * FILL (cover): image scaled to fully cover the surface, cropping any
 *   overflow -- no distortion, no gaps.
 * FIT (contain): image scaled to fit entirely within the surface
 *   without cropping. NOTE: this is approximated via ClampToEdge
 *   texture wrapping rather than true letterbox bars (the app has no
 *   per-pixel alpha compositing step for the LED surface), so the
 *   "unfilled" margin reads as a stretched edge pixel rather than
 *   black -- an intentional, documented MVP simplification.
 */
export function computeFitTransform(fitMode: FitMode, imageAspect: number, surfaceAspect: number): UVTransform {
  if (fitMode === "STRETCH") {
    return { repeatX: 1, repeatY: 1, offsetX: 0, offsetY: 0 };
  }

  const wider = imageAspect > surfaceAspect;

  if (fitMode === "FILL") {
    if (wider) {
      const repeatX = surfaceAspect / imageAspect;
      return { repeatX, repeatY: 1, offsetX: (1 - repeatX) / 2, offsetY: 0 };
    }
    const repeatY = imageAspect / surfaceAspect;
    return { repeatX: 1, repeatY, offsetX: 0, offsetY: (1 - repeatY) / 2 };
  }

  // FIT (contain) -- mathematical inverse of FILL.
  if (wider) {
    const repeatY = imageAspect / surfaceAspect;
    return { repeatX: 1, repeatY, offsetX: 0, offsetY: (1 - repeatY) / 2 };
  }
  const repeatX = surfaceAspect / imageAspect;
  return { repeatX, repeatY: 1, offsetX: (1 - repeatX) / 2, offsetY: 0 };
}
