import { describe, it, expect, beforeEach } from "vitest";
import { buildProjectFile, applyProjectFile } from "@/utils/projectFile";
import { useCameraStore } from "@/store/cameraStore";
import { useSimulatorStore } from "@/store/simulatorStore";

describe("project file round-trip", () => {
  beforeEach(() => {
    // Reset to a known state before each test.
    useCameraStore.getState().setPosition(0, 1.5, 0);
    useCameraStore.getState().setPan(0);
    useCameraStore.getState().setFocalLength(24);
  });

  it("captures the current camera position/orientation and restores it after a change", () => {
    useCameraStore.getState().setPosition(1.23, 1.8, -2.5);
    useCameraStore.getState().setPan(37);
    useCameraStore.getState().setTilt(-5);
    useCameraStore.getState().setFocalLength(50);

    const project = buildProjectFile();
    expect(project.camera.position).toEqual({ x: 1.23, y: 1.8, z: -2.5 });
    expect(project.camera.pan).toBe(37);
    expect(project.lens.focalLength).toBe(50);

    // Mutate the state away from the saved snapshot...
    useCameraStore.getState().setPosition(0, 0, 0);
    useCameraStore.getState().setPan(0);
    useCameraStore.getState().setFocalLength(18);

    // ...then restore from the saved project and verify it matches again.
    applyProjectFile(project);
    const restored = useCameraStore.getState();
    expect(restored.camera.positionX).toBeCloseTo(1.23, 6);
    expect(restored.camera.positionY).toBeCloseTo(1.8, 6);
    expect(restored.camera.positionZ).toBeCloseTo(-2.5, 6);
    expect(restored.camera.pan).toBe(37);
    expect(restored.lens.focalLengthMm).toBe(50);
  });

  it("round-trips the view mode and coverage overlay mode", () => {
    useSimulatorStore.getState().setViewMode("TOP");
    useSimulatorStore.getState().setCoverageOverlayMode("HEATMAP");

    const project = buildProjectFile();
    expect(project.view.viewMode).toBe("TOP");
    expect(project.view.coverageOverlayMode).toBe("HEATMAP");

    useSimulatorStore.getState().setViewMode("PERSPECTIVE");
    useSimulatorStore.getState().setCoverageOverlayMode("OFF");

    applyProjectFile(project);
    expect(useSimulatorStore.getState().viewMode).toBe("TOP");
    expect(useSimulatorStore.getState().coverageOverlayMode).toBe("HEATMAP");
  });
});
