import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import { useSimulatorStore } from "@/store/simulatorStore";
import { LEDVolume } from "@/components/stage/LEDVolume";
import { CeilingLED } from "@/components/stage/CeilingLED";
import { Platform } from "@/components/stage/Platform";
import { CameraView } from "@/components/views/CameraView";
import { useTextureStore } from "@/store/textureStore";
import { calculateMainLEDBottomY } from "@/utils/ledMath";
import type { ViewMode } from "@/store/simulatorStore";

/**
 * TEMPORARY DIAGNOSTIC BUILD: stripped down to the bare minimum
 * (Platform + LEDVolume + CeilingLED + OrbitControls) to isolate why
 * the Main LED texture renders correctly in CameraView but not here.
 * StageAxes, CameraModel, CameraFrustum, CameraTransformControls,
 * SafetyZone, SafeAreaOverlay, GizmoHelper, ScreenshotCapture, and the
 * gridHelper are all temporarily removed. Restore them once the root
 * cause is found.
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
  const mainLEDImageDataUrl = useTextureStore((s) => s.mainLEDImageDataUrl);
  const mainLEDFitMode = useTextureStore((s) => s.mainLEDFitMode);
  const ceilingLEDImageDataUrl = useTextureStore((s) => s.ceilingLEDImageDataUrl);
  const ceilingLEDFitMode = useTextureStore((s) => s.ceilingLEDFitMode);

  const pose = useMemo(
    () => getEditorCameraPose(viewMode, stage.mainLED.radius),
    [viewMode, stage.mainLED.radius]
  );

  if (viewMode === "CAMERA") {
    return <CameraView />;
  }

  return (
    <Canvas
      key={viewMode}
      camera={{ position: pose.position, up: pose.up, fov: 50, near: 0.05, far: 200 }}
    >
      <color attach="background" args={["#0a0c0f"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 5]} intensity={0.8} />

      <Platform config={stage.platform} mainLED={stage.mainLED} />
      <LEDVolume
        config={stage.mainLED}
        bottomY={calculateMainLEDBottomY(stage.mainLED, stage.platform)}
        imageUrl={mainLEDImageDataUrl}
        fitMode={mainLEDFitMode}
      />
      <CeilingLED config={stage.ceilingLED} imageUrl={ceilingLEDImageDataUrl} fitMode={ceilingLEDFitMode} />

      <OrbitControls makeDefault target={[0, stage.mainLED.height / 2, 0]} />
    </Canvas>
  );
}
