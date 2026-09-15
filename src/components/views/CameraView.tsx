import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { useSimulatorStore } from "@/store/simulatorStore";
import { useSimulatedCamera } from "@/components/camera/useSimulatedCamera";
import { useCoverage } from "@/components/camera/useCoverage";
import { LEDVolume } from "@/components/stage/LEDVolume";
import { CeilingLED } from "@/components/stage/CeilingLED";
import { Platform } from "@/components/stage/Platform";
import { CoverageOverlay } from "@/components/views/CoverageOverlay";
import { useTextureStore } from "@/store/textureStore";
import { calculateMainLEDBottomY } from "@/utils/ledMath";

/**
 * Forces the R3F canvas to render through our externally-managed
 * THREE.PerspectiveCamera (the simulated cinema camera) instead of a
 * camera R3F would create for us. This is what makes CAMERA VIEW show
 * exactly what the cinema camera sees.
 */
function UseExternalCamera({ camera }: { camera: THREE.PerspectiveCamera }) {
  const set = useThree((s) => s.set);
  const size = useThree((s) => s.size);

  useEffect(() => {
    set({ camera });
  }, [camera, set]);

  // Keep the camera's aspect matching the canvas pixel aspect isn't
  // desired here -- we WANT the camera's aspect fixed to the sensor's
  // aspect ratio (set in useSimulatedCamera), and letterbox the canvas
  // via CSS instead. So this effect intentionally does not touch
  // camera.aspect based on `size`.
  useEffect(() => {
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

const STATUS_TEXT_COLOR = {
  SAFE: "text-vp-safe",
  WARNING: "text-vp-warning",
  VIOLATION: "text-vp-violation",
} as const;

export function CameraView() {
  const stage = useSimulatorStore((s) => s.stage);
  const coverageOverlayMode = useSimulatorStore((s) => s.coverageOverlayMode);
  const setCoverageOverlayMode = useSimulatorStore((s) => s.setCoverageOverlayMode);
  const { camera, fov, sensorAspect, cameraName, sensorModeName } = useSimulatedCamera();
  const coverage = useCoverage();
  const mainLEDImageDataUrl = useTextureStore((s) => s.mainLEDImageDataUrl);
  const mainLEDFitMode = useTextureStore((s) => s.mainLEDFitMode);
  const ceilingLEDImageDataUrl = useTextureStore((s) => s.ceilingLEDImageDataUrl);
  const ceilingLEDFitMode = useTextureStore((s) => s.ceilingLEDFitMode);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-black">
      <div
        className="relative h-full max-h-full"
        style={{ aspectRatio: `${sensorAspect}`, maxWidth: "100%" }}
      >
        <Canvas>
          <UseExternalCamera camera={camera} />
          <color attach="background" args={["#000000"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 15, 5]} intensity={0.8} />
          <Platform config={stage.platform} mainLED={stage.mainLED} />
          <LEDVolume
            config={stage.mainLED}
            bottomY={calculateMainLEDBottomY(stage.mainLED, stage.platform)}
            imageUrl={mainLEDImageDataUrl}
            fitMode={mainLEDFitMode}
          />
          <CeilingLED config={stage.ceilingLED} imageUrl={ceilingLEDImageDataUrl} fitMode={ceilingLEDFitMode} />
        </Canvas>

        <CoverageOverlay coverage={coverage} mode={coverageOverlayMode} opacity={0.55} />

        {/* Overlay: center cross, frame boundary, telemetry */}
        <div className="pointer-events-none absolute inset-0 border border-white/30">
          <div className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-white/60" />
          <div className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-white/60" />

          <div className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 font-mono text-[10px] text-white/90">
            {cameraName} · {sensorModeName}
          </div>
          <div className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-right font-mono text-[10px] text-white/90">
            HFOV {fov.hfovDeg.toFixed(1)}° · VFOV {fov.vfovDeg.toFixed(1)}°
          </div>
          <div
            className={`absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 font-mono text-[10px] font-semibold ${STATUS_TEXT_COLOR[coverage.shootingStatus]}`}
          >
            ● {coverage.shootingStatus} — LED {coverage.mainLEDPercent.toFixed(1)}% / OUT{" "}
            {coverage.outsidePercent.toFixed(1)}%
          </div>

          <div className="pointer-events-auto absolute bottom-2 right-2 flex overflow-hidden rounded border border-white/30">
            {(["OFF", "STATUS", "HEATMAP"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setCoverageOverlayMode(m)}
                className={`px-2 py-1 text-[9px] uppercase ${
                  coverageOverlayMode === m ? "bg-vp-accent text-white" : "bg-black/60 text-white/70"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
