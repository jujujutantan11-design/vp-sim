import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  calculateHFOV,
  calculateVFOV,
  calculateDFOV,
  calculateSensorDiagonal,
  calculateFOV,
  panTiltRollToQuaternion,
  buildSimulatedCamera,
} from "@/utils/cameraMath";

describe("calculateHFOV / calculateVFOV", () => {
  it("matches the textbook formula: HFOV = 2*atan(sensorWidth/(2*focalLength))", () => {
    // sensorWidth = 2 * focalLength => atan(1) => HFOV = 2 * 45deg = 90deg
    const focal = 10;
    const sensorWidth = 2 * focal; // 20mm
    const hfov = calculateHFOV(sensorWidth, focal);
    expect((hfov * 180) / Math.PI).toBeCloseTo(90, 6);
  });

  it("ALEXA 35 Open Gate (28.0mm) at 24mm focal length produces expected HFOV", () => {
    // HFOV = 2*atan(28.0 / (2*24)) = 2*atan(0.58333)
    const hfov = calculateHFOV(28.0, 24);
    const expectedDeg = (2 * Math.atan(28.0 / 48)) * (180 / Math.PI);
    expect((hfov * 180) / Math.PI).toBeCloseTo(expectedDeg, 8);
    expect((hfov * 180) / Math.PI).toBeCloseTo(60.5, 0);
  });

  it("longer focal length produces smaller FOV (monotonic)", () => {
    const hfov24 = calculateHFOV(28.0, 24);
    const hfov125 = calculateHFOV(28.0, 125);
    expect(hfov125).toBeLessThan(hfov24);
  });
});

describe("calculateSensorDiagonal / calculateDFOV", () => {
  it("computes diagonal via Pythagorean theorem", () => {
    expect(calculateSensorDiagonal(3, 4)).toBeCloseTo(5, 10);
  });

  it("DFOV >= HFOV and DFOV >= VFOV for a rectangular sensor", () => {
    const w = 28.0;
    const h = 19.2;
    const focal = 35;
    const hfov = calculateHFOV(w, focal);
    const vfov = calculateVFOV(h, focal);
    const dfov = calculateDFOV(w, h, focal);
    expect(dfov).toBeGreaterThanOrEqual(hfov);
    expect(dfov).toBeGreaterThanOrEqual(vfov);
  });
});

describe("calculateFOV", () => {
  it("returns consistent radians/degrees pairs", () => {
    const result = calculateFOV(28.0, 19.2, 24);
    expect(result.hfovDeg).toBeCloseTo((result.hfovRad * 180) / Math.PI, 10);
    expect(result.vfovDeg).toBeCloseTo((result.vfovRad * 180) / Math.PI, 10);
    expect(result.dfovDeg).toBeCloseTo((result.dfovRad * 180) / Math.PI, 10);
  });
});

describe("panTiltRollToQuaternion", () => {
  it("identity (0,0,0) produces the default -Z forward direction", () => {
    const q = panTiltRollToQuaternion(0, 0, 0);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
    expect(forward.x).toBeCloseTo(0, 6);
    expect(forward.y).toBeCloseTo(0, 6);
    expect(forward.z).toBeCloseTo(-1, 6);
  });

  it("pan=90 rotates the forward vector toward +X", () => {
    const q = panTiltRollToQuaternion(90, 0, 0);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
    expect(forward.x).toBeCloseTo(1, 5);
    expect(forward.z).toBeCloseTo(0, 5);
  });

  it("tilt=90 rotates the forward vector toward +Y (looking straight up)", () => {
    const q = panTiltRollToQuaternion(0, 90, 0);
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
    expect(forward.y).toBeCloseTo(1, 5);
  });
});

describe("buildSimulatedCamera", () => {
  it("positions the camera and sets projection matrix without throwing", () => {
    const cam = buildSimulatedCamera({
      positionX: 1,
      positionY: 1.5,
      positionZ: 2,
      panDeg: 10,
      tiltDeg: -5,
      rollDeg: 0,
      vfovDeg: 40,
      aspect: 16 / 9,
      near: 0.1,
      far: 100,
    });
    expect(cam.position.x).toBeCloseTo(1);
    expect(cam.position.y).toBeCloseTo(1.5);
    expect(cam.position.z).toBeCloseTo(2);
    expect(cam.fov).toBeCloseTo(40);
    expect(cam.projectionMatrix.elements.length).toBe(16);
  });
});
