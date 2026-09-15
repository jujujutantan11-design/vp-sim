import { describe, it, expect } from "vitest";
import { calculateSafeArea, calculateMovementMargin } from "@/utils/safeArea";
import { calculateFOV } from "@/utils/cameraMath";
import { TOEI_NO11_STAGE } from "@/config/stages/toeiNo11";

describe("calculateSafeArea", () => {
  it("produces a grid of cells covering the requested extent, all classified", () => {
    const fov = calculateFOV(28.0, 19.2, 35);
    const result = calculateSafeArea({
      stage: TOEI_NO11_STAGE,
      cameraHeightM: 1.5,
      fixedPanDeg: 0,
      fixedTiltDeg: 0,
      fixedRollDeg: 0,
      orientationMode: "LOOK_AT_STAGE_CENTER",
      hfovRad: fov.hfovRad,
      vfovRad: fov.vfovRad,
      aspect: 28.0 / 19.2,
      gridSpacingM: 1.5, // coarse spacing to keep the test fast
    });

    expect(result.cells.length).toBeGreaterThan(0);
    for (const cell of result.cells) {
      expect(["SAFE", "WARNING", "UNSAFE"]).toContain(cell.status);
    }
  });

  it("cells right at the wall are UNSAFE; cells near center (with LOOK_AT_STAGE_CENTER) tend to be SAFE", () => {
    const fov = calculateFOV(28.0, 19.2, 35);
    const result = calculateSafeArea({
      stage: TOEI_NO11_STAGE,
      cameraHeightM: 1.5,
      fixedPanDeg: 0,
      fixedTiltDeg: 0,
      fixedRollDeg: 0,
      orientationMode: "LOOK_AT_STAGE_CENTER",
      hfovRad: fov.hfovRad,
      vfovRad: fov.vfovRad,
      aspect: 28.0 / 19.2,
      gridSpacingM: 1.0,
    });

    const centerCell = result.cells.find((c) => Math.abs(c.x) < 0.6 && Math.abs(c.z) < 0.6);
    expect(centerCell?.status).toBe("SAFE");

    const nearWallCell = result.cells.find(
      (c) => Math.abs(c.x) < 0.6 && c.z < -(TOEI_NO11_STAGE.mainLED.radius - 0.3)
    );
    expect(nearWallCell?.status).toBe("UNSAFE");
  });
});

describe("calculateMovementMargin", () => {
  it("returns zero or positive margins in all four directions from a safe center position", () => {
    const fov = calculateFOV(28.0, 19.2, 35);
    const safeArea = calculateSafeArea({
      stage: TOEI_NO11_STAGE,
      cameraHeightM: 1.5,
      fixedPanDeg: 0,
      fixedTiltDeg: 0,
      fixedRollDeg: 0,
      orientationMode: "LOOK_AT_STAGE_CENTER",
      hfovRad: fov.hfovRad,
      vfovRad: fov.vfovRad,
      aspect: 28.0 / 19.2,
      gridSpacingM: 1.0,
    });

    const margin = calculateMovementMargin(safeArea, 0, 0, 0);
    expect(margin.forwardM).toBeGreaterThanOrEqual(0);
    expect(margin.backwardM).toBeGreaterThanOrEqual(0);
    expect(margin.leftM).toBeGreaterThanOrEqual(0);
    expect(margin.rightM).toBeGreaterThanOrEqual(0);
  });
});
