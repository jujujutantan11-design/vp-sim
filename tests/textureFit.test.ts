import { describe, it, expect } from "vitest";
import { computeFitTransform } from "@/utils/textureFit";

describe("computeFitTransform", () => {
  it("STRETCH always returns identity regardless of aspect ratios", () => {
    expect(computeFitTransform("STRETCH", 2.5, 0.4)).toEqual({
      repeatX: 1,
      repeatY: 1,
      offsetX: 0,
      offsetY: 0,
    });
  });

  it("FILL crops the wider dimension when image is wider than the surface", () => {
    const t = computeFitTransform("FILL", 2, 1); // image is 2x wider than tall, surface is square
    expect(t.repeatX).toBeCloseTo(0.5, 6);
    expect(t.repeatY).toBeCloseTo(1, 6);
    expect(t.offsetX).toBeCloseTo(0.25, 6);
  });

  it("FIT and FILL are mathematically inverse on the constrained axis", () => {
    const fill = computeFitTransform("FILL", 2, 1);
    const fit = computeFitTransform("FIT", 2, 1);
    // FILL constrains X (crops), FIT constrains Y (pads) for the same aspect mismatch.
    expect(fill.repeatX).toBeCloseTo(1 / fit.repeatY, 6);
  });

  it("square image on square surface needs no transform under FILL or FIT", () => {
    expect(computeFitTransform("FILL", 1, 1)).toEqual({ repeatX: 1, repeatY: 1, offsetX: 0, offsetY: 0 });
    expect(computeFitTransform("FIT", 1, 1)).toEqual({ repeatX: 1, repeatY: 1, offsetX: 0, offsetY: 0 });
  });
});
