import { Canvas } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { useMemo } from "react";
import { useSimulatorStore } from "@/store/simulatorStore";
import { LEDVolume } from "@/components/stage/LEDVolume";
import { CeilingLED } from "@/components/stage/CeilingLED";
import { Platform } from "@/components/stage/Platform";
import { StageAxes } from "@/components/stage/StageAxes";
import { CameraModel } from "@/components/camera/CameraModel";
import { CameraFrustum } from "@/components/camera/CameraFrustum";
import { CameraTransformControls } from "@/components/camera/CameraTransformControls";
import { CameraView } from "@/components/views/CameraView";
import type { ViewMode } from "@/store/simulatorStore";

/**
 * Editor camera presets for each non-perspective view mode. These control
 * ONLY the editor/navigation camera (via OrbitControls) -- per spec §13,
 * OrbitControls must NEVER touch the simulated cinema camera (introduced
 * in Phase 2).
 */
function getEditorCameraPose(viewMode: ViewMode, stageRadius: number) {
  const d = stageRadius * 2.5;
  switch (viewMode) {
    case "TOP":
      return { position: [0, d, 0.01] as [number, number, number], up: [0, 0, -1] as [number, number, number] };
    case "FRONT":
      return { position: [0, stageRadius * 0.6, d] as [number, number, number], up: [0, 1, 0] as [number, number, number] };
    case "SIDE":
      return { position: [d, stageRadius * 0.6, 0] as [number, number, number], up: [0, 1, 0] as [number, number, number] };
    case "PERSPECTIVE":
    default:
      return { position: [d * 0.7, stageRadius * 1.2, d * 0.7] as [number, number, number], up: [0, 1, 0] as [number, number, number] };
  }
}

export function StageView() {
  const stage = useSimulatorStore((s) => s.stage);
  const viewMode = useSimulatorStore((s) => s.viewMode);
  const showAxes = useSimulatorStore((s) => s.showAxes);
  const isTransformDragging = useSimulatorStore((s) => s.isTransformDragging);
  const transformMode = useSimulatorStore((s) => s.transformMode);

  const pose = useMemo(
    () => getEditorCameraPose(viewMode, stage.mainLED.radius),
    [viewMode, stage.mainLED.radius]
  );

  if (viewMode === "CAMERA") {
    return <CameraView />;
  }

  return (
    <Canvas
      key={viewMode} // force camera pose reset when switching view modes
      camera={{ position: pose.position, up: pose.up, fov: 50, near: 0.05, far: 200 }}
      shadows
    >
      <color attach="background" args={["#0a0c0f"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 5]} intensity={0.8} castShadow />
      <gridHelper args={[60, 60, "#2a2f38", "#1a1e24"]} position={[0, -stage.platform.height, 0]} />

      <Platform config={stage.platform} mainLED={stage.mainLED} />
      <LEDVolume config={stage.mainLED} />
      <CeilingLED config={stage.ceilingLED} />
      {showAxes && <StageAxes openingDirection={stage.mainLED.openingDirection} />}

      <CameraModel />
      <CameraFrustum />
      <CameraTransformControls mode={transformMode} />

      <OrbitControls
        makeDefault
        enabled={!isTransformDragging}
        target={[0, stage.mainLED.height / 2, 0]}
      />
      <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
        <GizmoViewport />
      </GizmoHelper>
    </Canvas>
  );
}
