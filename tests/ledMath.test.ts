import { describe, it, expect } from "vitest";
import { calculateArcLength, calculateResolutionFromPitch, buildStageDiagnostics } from "@/utils/ledMath";
import { TOEI_NO11_STAGE } from "@/config/stages/toeiNo11";

describe("calculateArcLength", () => {
  it("computes arc length = radius * radians(angle)", () => {
    // Quarter circle of radius 1 => PI/2
    expect(calculateArcLength(1, 90)).toBeCloseTo(Math.PI / 2, 10);
  });

  it("does NOT equal the published 30m wall width for the TOEI No.11 drawing radius", () => {
    // radius = 6.318, arc = 270deg
    const arcLength = calculateArcLength(6.318, 270);
    // This is intentionally verifying the KNOWN discrepancy exists,
    // not "fixing" it -- see spec §7 / §31.
    expect(arcLength).not.toBeCloseTo(30.0, 1);
    expect(arcLength).toBeCloseTo(29.773, 2);
  });
});

describe("calculateResolutionFromPitch", () => {
  it("derives resolution from physical size / pixel pitch", () => {
    // 1m / 1mm pitch => 1000 pixels
    const res = calculateResolutionFromPitch(1, 1, 1);
    expect(res).toEqual({ width: 1000, height: 1000 });
  });
});

describe("buildStageDiagnostics (TOEI No.11 preset)", () => {
  const diagnostics = buildStageDiagnostics(TOEI_NO11_STAGE);

  it("preserves the published wall width unmodified", () => {
    expect(diagnostics.publishedWallWidth).toBe(30.0);
  });

  it("preserves both diameter sources distinctly", () => {
    expect(diagnostics.publishedNominalDiameter).toBe(12.0);
    expect(diagnostics.drawingReferenceDiameter).toBe(12.636);
    expect(diagnostics.publishedNominalDiameter).not.toBe(diagnostics.drawingReferenceDiameter);
  });

  it("surfaces a nonzero difference between calculated arc length and published wall width", () => {
    expect(Math.abs(diagnostics.arcLengthDifference)).toBeGreaterThan(0);
  });

  it("never overwrites published resolution with the pitch-calculated one", () => {
    expect(diagnostics.mainLEDPublishedResolution).toEqual({ width: 19200, height: 3200 });
    expect(diagnostics.mainLEDCalculatedResolutionFromPitch).not.toEqual(
      diagnostics.mainLEDPublishedResolution
    );
  });
});
