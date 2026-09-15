import { useCameraStore, getActiveSensorDimensions } from "@/store/cameraStore";
import { useSimulatorStore } from "@/store/simulatorStore";
import { CAMERA_PRESETS } from "@/config/cameras";
import { TOEI_NO11_EQUIPMENT } from "@/config/lenses";

function NumberField({
  label,
  value,
  onChange,
  step = 0.01,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="flex items-center justify-between py-1 text-xs">
      <span className="text-neutral-400">{label}</span>
      <span className="flex items-center gap-1">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-20 rounded border border-vp-border bg-vp-bg px-1.5 py-0.5 text-right font-mono text-neutral-100 focus:border-vp-accent focus:outline-none"
        />
        {suffix && <span className="w-6 text-neutral-500">{suffix}</span>}
      </span>
    </label>
  );
}

export function CameraPanel() {
  const camera = useCameraStore((s) => s.camera);
  const setCameraPreset = useCameraStore((s) => s.setCameraPreset);
  const setSensorMode = useCameraStore((s) => s.setSensorMode);
  const setPosition = useCameraStore((s) => s.setPosition);
  const setPan = useCameraStore((s) => s.setPan);
  const setTilt = useCameraStore((s) => s.setTilt);
  const setRoll = useCameraStore((s) => s.setRoll);

  const transformMode = useSimulatorStore((s) => s.transformMode);
  const setTransformMode = useSimulatorStore((s) => s.setTransformMode);
  const toeiEquipmentOnly = useCameraStore((s) => s.toeiEquipmentOnly);

  const preset = CAMERA_PRESETS[camera.cameraPresetId];
  const mode = preset?.sensorModes.find((m) => m.id === camera.sensorModeId) ?? preset?.sensorModes[0];
  const dims = getActiveSensorDimensions(camera);
  const availableCameras = toeiEquipmentOnly
    ? Object.values(CAMERA_PRESETS).filter((p) => p.id === TOEI_NO11_EQUIPMENT.camera)
    : Object.values(CAMERA_PRESETS);

  return (
    <div className="border-b border-vp-border px-3 py-3">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
        CAMERA
      </div>

      <label className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-neutral-400">Camera</span>
        <select
          value={camera.cameraPresetId}
          onChange={(e) => setCameraPreset(e.target.value)}
          className="rounded border border-vp-border bg-vp-bg px-1.5 py-0.5 text-neutral-100"
        >
          {availableCameras.map((p) => (
            <option key={p.id} value={p.id}>
              {p.manufacturer} {p.model}
            </option>
          ))}
        </select>
      </label>

      <label className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-neutral-400">Sensor Mode</span>
        <select
          value={camera.sensorModeId}
          onChange={(e) => setSensorMode(e.target.value)}
          className="rounded border border-vp-border bg-vp-bg px-1.5 py-0.5 text-neutral-100"
        >
          {preset?.sensorModes.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center justify-between py-0.5 text-xs">
        <span className="text-neutral-400">Active Sensor</span>
        <span className="font-mono text-neutral-100">
          {dims.widthMm.toFixed(2)} × {dims.heightMm.toFixed(2)} mm
        </span>
      </div>
      {mode && (
        <>
          <div className="flex items-center justify-between py-0.5 text-xs">
            <span className="text-neutral-400">Resolution</span>
            <span className="font-mono text-neutral-100">
              {mode.resolutionWidth} × {mode.resolutionHeight}
            </span>
          </div>
          <div className="mb-2 flex items-center justify-between py-0.5 text-xs">
            <span className="text-neutral-400">Aspect</span>
            <span className="font-mono text-neutral-100">{mode.aspectRatio.toFixed(2)}:1</span>
          </div>
          <div className="mb-3 text-[10px] text-neutral-600">
            {mode.verified ? "✓ " : "● "}
            {mode.source}
          </div>
        </>
      )}

      <div className="mb-1.5 mt-2 border-t border-vp-border pt-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
        POSITION
      </div>
      <NumberField label="X" value={camera.positionX} suffix="m" onChange={(v) => setPosition(v, camera.positionY, camera.positionZ)} />
      <NumberField label="Y" value={camera.positionY} suffix="m" onChange={(v) => setPosition(camera.positionX, v, camera.positionZ)} />
      <NumberField label="Z" value={camera.positionZ} suffix="m" onChange={(v) => setPosition(camera.positionX, camera.positionY, v)} />
      <NumberField label="Pan" value={camera.pan} step={1} suffix="°" onChange={setPan} />
      <NumberField label="Tilt" value={camera.tilt} step={1} suffix="°" onChange={setTilt} />
      <NumberField label="Roll" value={camera.roll} step={1} suffix="°" onChange={setRoll} />

      <div className="mt-2 flex overflow-hidden rounded border border-vp-border">
        {(["translate", "rotate"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setTransformMode(m)}
            className={`flex-1 py-1 text-[10px] uppercase ${
              transformMode === m ? "bg-vp-accent text-white" : "bg-vp-bg text-neutral-400"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
