import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { sampleCoverage, calculateFrameEdges, calculateShootingStatus } from "@/utils/coverage";
import { calculateFOV, panTiltRollToQuaternion } from "@/utils/cameraMath";
import { TOEI_NO11_STAGE } from "@/config/stages/toeiNo11";
import type { SurfaceClassification } from "@/types/simulator";

function makeCamera(params: {
  x: number;
  y: number;
  z: number;
  panDeg: number;
  tiltDeg: number;
  vfovDeg: number;
  aspect: number;
}): THREE.PerspectiveCamera {
  const cam = new THREE.PerspectiveCamera(params.vfovDeg, params.aspect, 0.05, 100);
  cam.position.set(params.x, params.y, params.z);
  cam.quaternion.copy(panTiltRollToQuaternion(params.panDeg, params.tiltDeg, 0));
  cam.updateMatrixWorld(true);
  cam.updateProjectionMatrix();
  return cam;
}

describe("sampleCoverage", () => {
  it("a narrow-FOV camera centered on the stage, looking directly at the wall, is ~100% MAIN_LED", () => {
    const fov = calculateFOV(28.0, 19.2, 125); // long lens = narrow FOV
    const cam = makeCamera({
      x: 0,
      y: 1.5,
      z: 0,
      panDeg: 0, // looks toward -Z, i.e. directly at the wall opposite the +Z opening
      tiltDeg: 0,
      vfovDeg: fov.vfovDeg,
      aspect: 28.0 / 19.2,
    });

    const result = sampleCoverage(cam, fov.hfovRad, fov.vfovRad, TOEI_NO11_STAGE, 16, 9);
    expect(result.mainLEDPercent).toBeGreaterThan(99);
    expect(result.shootingStatus).toBe("SAFE");
  });

  it("a camera aimed through the +Z opening sees mostly OUTSIDE_LED", () => {
    const fov = calculateFOV(28.0, 19.2, 50);
    const cam = makeCamera({
      x: 0,
      y: 1.5,
      z: 0,
      panDeg: 180, // pan=180 => forward flips to +Z (through the opening)
      tiltDeg: 0,
      vfovDeg: fov.vfovDeg,
      aspect: 28.0 / 19.2,
    });

    const result = sampleCoverage(cam, fov.hfovRad, fov.vfovRad, TOEI_NO11_STAGE, 16, 9);
    expect(result.outsidePercent).toBeGreaterThan(50);
    expect(result.shootingStatus).not.toBe("SAFE");
  });

  it("a very wide lens from center picks up some OUTSIDE_LED near the frame corners (vertical clipping)", () => {
    const fov = calculateFOV(28.0, 19.2, 8); // extremely wide
    const cam = makeCamera({
      x: 0,
      y: 1.5,
      z: 0,
      panDeg: 0,
      tiltDeg: 0,
      vfovDeg: fov.vfovDeg,
      aspect: 28.0 / 19.2,
    });

    const result = sampleCoverage(cam, fov.hfovRad, fov.vfovRad, TOEI_NO11_STAGE, 16, 9);
    // At 8mm from dead-center the horizontal spread still stays well
    // inside the 270-degree arc, but the top/bottom corner rays exceed
    // the wall's vertical extent (height 5.0m) before reaching the
    // horizontal radius -- expect measurable OUTSIDE_LED from that.
    expect(result.outsidePercent).toBeGreaterThan(0);
  });

  it("total sample classifications always sum to totalSamples", () => {
    const fov = calculateFOV(28.0, 19.2, 35);
    const cam = makeCamera({ x: 0, y: 1.5, z: 0, panDeg: 0, tiltDeg: 0, vfovDeg: fov.vfovDeg, aspect: 28.0 / 19.2 });
    const result = sampleCoverage(cam, fov.hfovRad, fov.vfovRad, TOEI_NO11_STAGE, 16, 9);
    expect(result.mainLEDHits + result.ceilingHits + result.outsideHits).toBe(result.totalSamples);
  });
});

describe("calculateFrameEdges", () => {
  it("flags an edge WARNING only when that edge's row/column contains an OUTSIDE_LED sample", () => {
    const w = 4;
    const h = 3;
    const samples: SurfaceClassification[] = new Array(w * h).fill("MAIN_LED");
    // Put a single OUTSIDE_LED sample in the top row (row 0)
    samples[0] = "OUTSIDE_LED";

    const edges = calculateFrameEdges(samples, w, h);
    expect(edges.top).toBe("WARNING");
    expect(edges.bottom).toBe("OK");
    expect(edges.left).toBe("WARNING"); // sample[0] is also in column 0
    expect(edges.right).toBe("OK");
  });

  it("reports all OK when there is no OUTSIDE_LED anywhere", () => {
    const samples: SurfaceClassification[] = new Array(4 * 3).fill("MAIN_LED");
    const edges = calculateFrameEdges(samples, 4, 3);
    expect(edges).toEqual({ top: "OK", bottom: "OK", left: "OK", right: "OK" });
  });
});

describe("calculateShootingStatus", () => {
  const okEdges = { top: "OK", bottom: "OK", left: "OK", right: "OK" } as const;
  const warnEdges = { top: "WARNING", bottom: "OK", left: "OK", right: "OK" } as const;

  it("is SAFE when outside% is within tolerance and no edge warnings", () => {
    expect(calculateShootingStatus(0, okEdges)).toBe("SAFE");
  });

  it("is not SAFE if any frame edge has a warning, even with 0% outside overall", () => {
    expect(calculateShootingStatus(0, warnEdges)).not.toBe("SAFE");
  });

  it("is VIOLATION above the violation threshold", () => {
    expect(calculateShootingStatus(10, okEdges)).toBe("VIOLATION");
  });

  it("is WARNING between the safe and violation thresholds", () => {
    expect(calculateShootingStatus(1, okEdges)).toBe("WARNING");
  });
});
