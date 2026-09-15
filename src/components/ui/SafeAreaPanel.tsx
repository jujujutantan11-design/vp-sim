import { useEffect, useRef } from "react";
import { useSafeAreaStore } from "@/store/safeAreaStore";
import { useSimulatorStore } from "@/store/simulatorStore";
import { useCameraStore } from "@/store/cameraStore";
import { useSimulatedCamera } from "@/components/camera/useSimulatedCamera";
import { calculateSafeArea, calculateMovementMargin } from "@/utils/safeArea";
import { SAFE_AREA_DEFAULTS } from "@/config/thresholds";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className="text-neutral-400">{label}</span>
      <span className="font-mono text-neutral-100">{value}</span>
    </div>
  );
}

export function SafeAreaPanel() {
  const stage = useSimulatorStore((s) => s.stage);
  const camera = useCameraStore((s) => s.camera);
  const lens = useCameraStore((s) => s.lens);
  const { fov, sensorAspect } = useSimulatedCamera();

  const orientationMode = useSafeAreaStore((s) => s.orientationMode);
  const setOrientationMode = useSafeAreaStore((s) => s.setOrientationMode);
  const gridSpacingM = useSafeAreaStore((s) => s.gridSpacingM);
  const setGridSpacingM = useSafeAreaStore((s) => s.setGridSpacingM);
  const result = useSafeAreaStore((s) => s.result);
  const isCalculating = useSafeAreaStore((s) => s.isCalculating);
  const isStale = useSafeAreaStore((s) => s.isStale);
  const setResult = useSafeAreaStore((s) => s.setResult);
  const setCalculating = useSafeAreaStore((s) => s.setCalculating);
  const markStale = useSafeAreaStore((s) => s.markStale);

  // Mark the previous result STALE whenever camera/lens/stage change
  // (spec §10D) -- but not on first mount, and never auto-recalculate.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    markStale();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, camera, lens]);

  function handleCalculate() {
    setCalculating(true);
    // Yield to the browser once so the "CALCULATING..." state can paint
    // before the (synchronous, potentially expensive) computation runs.
    setTimeout(() => {
      const computed = calculateSafeArea({
        stage,
        cameraHeightM: camera.positionY,
        fixedPanDeg: camera.pan,
        fixedTiltDeg: camera.tilt,
        fixedRollDeg: camera.roll,
        orientationMode,
        hfovRad: fov.hfovRad,
        vfovRad: fov.vfovRad,
        aspect: sensorAspect,
        gridSpacingM,
      });
      setResult(computed);
    }, 20);
  }

  const margin = result
    ? calculateMovementMargin(result, camera.positionX, camera.positionZ, camera.pan)
    : null;

  return (
    <div className="border-b border-vp-border px-3 py-3">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
        撮影可能範囲 (SAFE SHOOTING AREA)
      </div>

      <label className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-neutral-400">Orientation</span>
        <select
          value={orientationMode}
          onChange={(e) => setOrientationMode(e.target.value as typeof orientationMode)}
          className="rounded border border-vp-border bg-vp-bg px-1.5 py-0.5 text-neutral-100"
        >
          <option value="LOOK_AT_STAGE_CENTER">Look at stage center</option>
          <option value="FIXED_ORIENTATION">Fixed (current pan/tilt/roll)</option>
        </select>
      </label>

      <label className="mb-2 flex items-center justify-between text-xs">
        <span className="text-neutral-400">Grid spacing</span>
        <select
          value={gridSpacingM}
          onChange={(e) => setGridSpacingM(parseFloat(e.target.value))}
          className="rounded border border-vp-border bg-vp-bg px-1.5 py-0.5 text-neutral-100"
        >
          {SAFE_AREA_DEFAULTS.selectableSpacingsM.map((s) => (
            <option key={s} value={s}>
              {s.toFixed(2)} m
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={handleCalculate}
        disabled={isCalculating}
        className="mb-2 w-full rounded bg-vp-accent px-2 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        {isCalculating ? "計算中... (CALCULATING)" : "撮影可能範囲を計算"}
      </button>

      {!result && !isCalculating && (
        <div className="text-[10px] text-neutral-600">
          未計算です。上のボタンで計算してください(自動計算はしません)。
        </div>
      )}

      {result && (
        <>
          {isStale && (
            <div className="mb-2 rounded border border-vp-warning/40 bg-vp-warning/10 px-2 py-1 text-[10px] text-vp-warning">
              撮影可能範囲を再計算してください (camera/lens/stage changed since last calculation)
            </div>
          )}
          <Row label="Cells" value={`${result.cells.length}`} />
          <Row label="Compute time" value={`${result.computeTimeMs.toFixed(0)} ms`} />

          {margin && (
            <>
              <div className="my-2 border-t border-vp-border" />
              <div className="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">
                カメラ移動可能量 (MOVEMENT MARGIN)
              </div>
              <Row label="Forward" value={`${margin.forwardM.toFixed(2)} m`} />
              <Row label="Backward" value={`${margin.backwardM.toFixed(2)} m`} />
              <Row label="Left" value={`${margin.leftM.toFixed(2)} m`} />
              <Row label="Right" value={`${margin.rightM.toFixed(2)} m`} />
            </>
          )}
        </>
      )}
    </div>
  );
}
