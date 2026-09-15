import { useSimulatedCamera } from "@/components/camera/useSimulatedCamera";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className="text-neutral-400">{label}</span>
      <span className="font-mono text-neutral-100">{value}</span>
    </div>
  );
}

export function AnalysisPanel() {
  const { fov, sensorWidthMm, sensorHeightMm, cameraName, sensorModeName } = useSimulatedCamera();

  return (
    <div className="border-b border-vp-border px-3 py-3">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
        ANALYSIS
      </div>

      <Row label="Camera" value={`${cameraName} / ${sensorModeName}`} />
      <Row label="Active Sensor" value={`${sensorWidthMm.toFixed(2)} × ${sensorHeightMm.toFixed(2)} mm`} />
      <div className="my-2 border-t border-vp-border" />
      <Row label="HFOV" value={`${fov.hfovDeg.toFixed(2)}°`} />
      <Row label="VFOV" value={`${fov.vfovDeg.toFixed(2)}°`} />
      <Row label="DFOV" value={`${fov.dfovDeg.toFixed(2)}°`} />

      <div className="mt-3 rounded border border-vp-border bg-vp-bg px-2 py-2 text-[10px] leading-relaxed text-neutral-600">
        LED Coverage / Outside LED / Frame Edges / Shooting Status / Safety
        Distance / Movement Margin arrive in Phase 3 &amp; Phase 4 (ray/LED
        intersection engine and safety zone).
      </div>
    </div>
  );
}
