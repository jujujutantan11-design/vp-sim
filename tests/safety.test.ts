import { describe, it, expect } from "vitest";
import { horizontalDistanceToMainLED, calculateSafetyAtPosition } from "@/utils/safety";
import { TOEI_NO11_STAGE } from "@/config/stages/toeiNo11";
import type { MainLEDConfig } from "@/types/stage";

const mainLED: MainLEDConfig = TOEI_NO11_STAGE.mainLED;

describe("horizontalDistanceToMainLED", () => {
  it("center of stage: distance equals the radius", () => {
    const d = horizontalDistanceToMainLED(0, 0, mainLED);
    expect(d).toBeCloseTo(mainLED.radius, 6);
  });

  it("a point directly against the wall (within the arc) has ~zero distance", () => {
    // theta=180deg (opposite the +Z opening) is well within the arc.
    const d = horizontalDistanceToMainLED(0, -mainLED.radius, mainLED);
    expect(d).toBeCloseTo(0, 6);
  });

  it("a point out in the middle of the +Z opening is NOT simply radius-minus-distance -- it uses the nearest arc edge", () => {
    // Standing 2m out from center, straight through the opening (+Z).
    // Naive `R - rCamera` would say ~4.3m; the real nearest LED point is
    // one of the two arc-boundary edges, which is much closer.
    const naive = mainLED.radius - 2;
    const d = horizontalDistanceToMainLED(0, 2, mainLED);
    expect(d).toBeLessThan(naive);
  });

  it("a point just inside the opening boundary and just outside it are continuous (no big jump)", () => {
    const { startRad } = (() => {
      // 45deg half-opening for a 270deg arc
      return { startRad: (45 * Math.PI) / 180 };
    })();
    const angleJustInside = startRad + 0.001;
    const angleJustOutside = startRad - 0.001;
    const r = mainLED.radius - 1;
    const pIn = [r * Math.sin(angleJustInside), r * Math.cos(angleJustInside)];
    const pOut = [r * Math.sin(angleJustOutside), r * Math.cos(angleJustOutside)];
    const dIn = horizontalDistanceToMainLED(pIn[0], pIn[1], mainLED);
    const dOut = horizontalDistanceToMainLED(pOut[0], pOut[1], mainLED);
    expect(Math.abs(dIn - dOut)).toBeLessThan(0.05);
  });
});

describe("calculateSafetyAtPosition", () => {
  it("center of a 6.318m-radius stage is SAFE (well beyond the 1m boundary)", () => {
    const result = calculateSafetyAtPosition({ x: 0, y: 1.5, z: 0 }, TOEI_NO11_STAGE);
    expect(result.status).toBe("SAFE");
  });

  it("a position within 1m of the wall is VIOLATION", () => {
    const result = calculateSafetyAtPosition(
      { x: 0, y: 1.5, z: -(mainLED.radius - 0.5) },
      TOEI_NO11_STAGE
    );
    expect(result.status).toBe("VIOLATION");
  });

  it("a position between the hard boundary and the warning margin is WARNING", () => {
    const result = calculateSafetyAtPosition(
      { x: 0, y: 1.5, z: -(mainLED.radius - 1.15) },
      TOEI_NO11_STAGE
    );
    expect(result.status).toBe("WARNING");
  });
});
