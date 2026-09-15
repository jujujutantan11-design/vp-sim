import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { intersectRayWithMainLED, intersectRayWithCeiling, castRay } from "@/utils/intersections";
import type { MainLEDConfig, CeilingLEDConfig } from "@/types/stage";

const mainLED: MainLEDConfig = {
  geometryMode: "DRAWING_DIAMETER",
  radius: 6.318,
  height: 5.0,
  supportMemberHeightM: 0.06,
  arcDegrees: 270,
  openingDirection: "+Z",
  publishedNominalDiameter: 12.0,
  drawingReferenceDiameter: 12.636,
  publishedWallWidth: 30.0,
  panelProduct: "AOTO RM1.5",
  pixelPitchMm: 1.56,
  publishedResolution: { width: 19200, height: 3200 },
  refreshRateHz: 7680,
  brightnessNit: 1500,
  contrastRatio: "15000:1",
  weightTon: 1.5,
  source: "TOEI_DOCUMENTED",
};

const ceilingLED: CeilingLEDConfig = {
  enabled: true,
  width: 12,
  depth: 11,
  height: 5.06,
  centerX: 0,
  centerZ: 0,
  publishedMaxHeightAboveFloor: 5.2,
  publishedMaxHeightAbovePlatform: 5.1,
  panelProduct: "AOTO M3.7H",
  pixelPitchMm: 3.75,
  publishedResolution: { width: 3072, height: 2816 },
  refreshRateHz: 7680,
  brightnessNit: 5000,
  contrastRatio: "5000:1",
  weightTon: 4.0,
  source: "TOEI_DOCUMENTED",
};

const bottomY = -0.11; // matches TOEI preset: 0.06 - 0.17

describe("intersectRayWithMainLED", () => {
  it("center camera looking toward -Z (opposite the +Z opening) hits the wall at distance = radius", () => {
    const origin = new THREE.Vector3(0, 1.5, 0);
    const direction = new THREE.Vector3(0, 0, -1);
    const result = intersectRayWithMainLED(origin, direction, mainLED, bottomY);
    expect(result.hit).toBe(true);
    expect(result.surface).toBe("MAIN_LED");
    expect(result.distance).toBeCloseTo(mainLED.radius, 6);
    expect(result.point![2]).toBeCloseTo(-mainLED.radius, 6);
  });

  it("ray pointing through the +Z opening (theta=0) does NOT hit the Main LED", () => {
    const origin = new THREE.Vector3(0, 1.5, 0);
    const direction = new THREE.Vector3(0, 0, 1); // straight toward the opening
    const result = intersectRayWithMainLED(origin, direction, mainLED, bottomY);
    expect(result.hit).toBe(false);
  });

  it("ray behind the camera (pointing away from a wall it would otherwise hit) is rejected", () => {
    // Origin outside the cylinder, direction pointing further away --
    // any intersection would be at negative t.
    const origin = new THREE.Vector3(0, 1.5, -20);
    const direction = new THREE.Vector3(0, 0, -1); // pointing away from the cylinder at z=-20
    const result = intersectRayWithMainLED(origin, direction, mainLED, bottomY);
    expect(result.hit).toBe(false);
  });

  it("ray outside the vertical [bottomY, bottomY+height] range misses even if angularly valid", () => {
    const origin = new THREE.Vector3(0, 100, 0); // way above the wall
    const direction = new THREE.Vector3(0, 0, -1);
    const result = intersectRayWithMainLED(origin, direction, mainLED, bottomY);
    expect(result.hit).toBe(false);
  });

  it("tangent ray (grazing the cylinder) does not produce a false MAIN_LED hit inside the opening", () => {
    // A ray from the center, nearly tangent to the opening boundary,
    // aimed just inside the opening sector -- should miss.
    const origin = new THREE.Vector3(0, 1.5, 0);
    const angleRad = (44 * Math.PI) / 180; // within the +/-45deg opening
    const direction = new THREE.Vector3(Math.sin(angleRad), 0, Math.cos(angleRad));
    const result = intersectRayWithMainLED(origin, direction, mainLED, bottomY);
    expect(result.hit).toBe(false);
  });

  it("a ray just past the opening boundary (46deg) DOES hit the wall", () => {
    const origin = new THREE.Vector3(0, 1.5, 0);
    const angleRad = (46 * Math.PI) / 180;
    const direction = new THREE.Vector3(Math.sin(angleRad), 0, Math.cos(angleRad));
    const result = intersectRayWithMainLED(origin, direction, mainLED, bottomY);
    expect(result.hit).toBe(true);
  });

  it("a purely vertical ray (parallel to the cylinder axis) never hits the side wall", () => {
    const origin = new THREE.Vector3(3, 1.5, 0); // inside the cylinder radius
    const direction = new THREE.Vector3(0, 1, 0);
    const result = intersectRayWithMainLED(origin, direction, mainLED, bottomY);
    expect(result.hit).toBe(false);
  });
});

describe("intersectRayWithCeiling", () => {
  it("straight-up ray from center hits the ceiling at the expected height", () => {
    const origin = new THREE.Vector3(0, 1.5, 0);
    const direction = new THREE.Vector3(0, 1, 0);
    const result = intersectRayWithCeiling(origin, direction, ceilingLED);
    expect(result.hit).toBe(true);
    expect(result.distance).toBeCloseTo(ceilingLED.height - 1.5, 6);
  });

  it("ray outside the ceiling's rectangular extent misses", () => {
    const origin = new THREE.Vector3(10, 1.5, 0); // beyond width/2 = 6
    const direction = new THREE.Vector3(0, 1, 0);
    const result = intersectRayWithCeiling(origin, direction, ceilingLED);
    expect(result.hit).toBe(false);
  });

  it("downward ray never hits the ceiling (behind the camera in ray-t terms)", () => {
    const origin = new THREE.Vector3(0, 1.5, 0);
    const direction = new THREE.Vector3(0, -1, 0);
    const result = intersectRayWithCeiling(origin, direction, ceilingLED);
    expect(result.hit).toBe(false);
  });

  it("disabled ceiling never registers a hit", () => {
    const disabled = { ...ceilingLED, enabled: false };
    const origin = new THREE.Vector3(0, 1.5, 0);
    const direction = new THREE.Vector3(0, 1, 0);
    const result = intersectRayWithCeiling(origin, direction, disabled);
    expect(result.hit).toBe(false);
  });
});

describe("castRay", () => {
  it("returns the nearer of Main LED / Ceiling LED when both would be hit along different rays", () => {
    const origin = new THREE.Vector3(0, 1.5, 0);
    const wallHit = castRay(origin, new THREE.Vector3(0, 0, -1), mainLED, ceilingLED, bottomY);
    expect(wallHit.surface).toBe("MAIN_LED");

    const ceilingHit = castRay(origin, new THREE.Vector3(0, 1, 0), mainLED, ceilingLED, bottomY);
    expect(ceilingHit.surface).toBe("CEILING_LED");
  });

  it("classifies OUTSIDE_LED when neither surface is hit", () => {
    const origin = new THREE.Vector3(0, 1.5, 0);
    const result = castRay(origin, new THREE.Vector3(0, 0, 1), mainLED, ceilingLED, bottomY);
    expect(result.hit).toBe(false);
    expect(result.surface).toBe("OUTSIDE_LED");
  });
});
