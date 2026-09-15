import { describe, it, expect } from "vitest";
import {
  getArcAngleRange,
  isAngleWithinLEDArc,
  normalizeAngle,
  xzToTheta,
  degToRad,
  radToDeg,
} from "@/utils/coordinates";

describe("degToRad / radToDeg", () => {
  it("converts 180 degrees to PI radians and back", () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI, 10);
    expect(radToDeg(Math.PI)).toBeCloseTo(180, 10);
  });
});

describe("normalizeAngle", () => {
  it("wraps negative angles into [0, 2PI)", () => {
    expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2, 10);
  });
  it("wraps angles greater than 2PI", () => {
    expect(normalizeAngle(Math.PI * 2 + 0.1)).toBeCloseTo(0.1, 10);
  });
});

describe("getArcAngleRange", () => {
  it("produces a 270 degree span for a 270-degree arc regardless of opening", () => {
    for (const dir of ["+Z", "-Z", "+X", "-X"] as const) {
      const { startRad, endRad } = getArcAngleRange(270, dir);
      let span = endRad - startRad;
      if (span < 0) span += Math.PI * 2;
      expect(radToDeg(span)).toBeCloseTo(270, 6);
    }
  });

  it("centers the opening sector on the opening direction (+Z => theta=0 is opening center)", () => {
    const { openingCenterRad } = getArcAngleRange(270, "+Z");
    expect(openingCenterRad).toBeCloseTo(0, 10);
  });

  it("centers the opening at 180deg for -Z opening", () => {
    const { openingCenterRad } = getArcAngleRange(270, "-Z");
    expect(radToDeg(normalizeAngle(openingCenterRad))).toBeCloseTo(180, 6);
  });
});

describe("isAngleWithinLEDArc", () => {
  it("theta=0 (+Z direction) is INSIDE the opening (not LED) when openingDirection=+Z", () => {
    expect(isAngleWithinLEDArc(0, 270, "+Z")).toBe(false);
  });

  it("theta=PI (-Z direction, directly opposite the +Z opening) is LED material", () => {
    expect(isAngleWithinLEDArc(Math.PI, 270, "+Z")).toBe(true);
  });

  it("theta at the exact opening boundary is still classified consistently", () => {
    const { startRad } = getArcAngleRange(270, "+Z");
    // Just inside the LED material side of the boundary
    expect(isAngleWithinLEDArc(startRad + 0.001, 270, "+Z")).toBe(true);
    // Just inside the opening side of the boundary
    expect(isAngleWithinLEDArc(startRad - 0.001, 270, "+Z")).toBe(false);
  });

  it("a full 90 degree opening sector centered on +Z is excluded", () => {
    // +Z opening spans [-45deg, +45deg] i.e. theta in [315deg, 360)U[0,45deg]
    expect(isAngleWithinLEDArc(degToRadHelper(20), 270, "+Z")).toBe(false);
    expect(isAngleWithinLEDArc(degToRadHelper(-20), 270, "+Z")).toBe(false);
    expect(isAngleWithinLEDArc(degToRadHelper(46), 270, "+Z")).toBe(true);
  });
});

describe("xzToTheta", () => {
  it("matches the x=R sin(theta), z=R cos(theta) convention", () => {
    const R = 6.318;
    for (const thetaDeg of [0, 45, 90, 135, 180, 225, 270, 315]) {
      const theta = degToRad(thetaDeg);
      const x = R * Math.sin(theta);
      const z = R * Math.cos(theta);
      const recovered = xzToTheta(x, z);
      expect(radToDeg(recovered)).toBeCloseTo(thetaDeg === 360 ? 0 : thetaDeg, 4);
    }
  });
});

function degToRadHelper(deg: number): number {
  return (deg * Math.PI) / 180;
}
