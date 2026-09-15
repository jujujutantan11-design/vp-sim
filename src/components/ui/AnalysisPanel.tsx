import { useSimulatedCamera } from "@/components/camera/useSimulatedCamera";
import { useCoverage } from "@/components/camera/useCoverage";
import { useSafety } from "@/components/camera/useSafety";
import type { ShootingStatus } from "@/types/simulator";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className="text-neutral-400">{label}</span>
      <span className="font-mono text-neutral-100">{value}</span>
    </div>
  );
}

const STATUS_STYLES: Record<ShootingStatus, string> = {
  SAFE: "bg-vp-safe/20 text-vp-safe border-vp-safe/40",
  WARNING: "bg-vp-warning/20 text-vp-warning border-vp-warning/40",
  VIOLATION: "bg-vp-violation/20 text-vp-violation border-vp-violation/40",
};

const STATUS_LABEL_JA: Record<ShootingStatus, string> = {
  SAFE: "撮影可能",
  WARNING: "注意",
  VIOLATION: "撮影不可",
};

function EdgeBadge({ label, status }: { label: string; status: "OK" | "WARNING" }) {
  return (
    <div className="flex items-center justify-between py-0.5 text-xs">
      <span className="text-neutral-400">{label}</span>
      <span className={status === "OK" ? "text-vp-safe" : "text-vp-warning"}>{status}</span>
    </div>
  );
}

export function AnalysisPanel() {
  const { fov, sensorWidthMm, sensorHeightMm, cameraName, sensorModeName } = useSimulatedCamera();
  const coverage = useCoverage();
  const safety = useSafety();

  return (
    <div className="border-b border-vp-border px-3 py-3">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
        ANALYSIS
      </div>

      <div className={`mb-3 flex items-center justify-between rounded border px-2 py-2 ${STATUS_STYLES[coverage.shootingStatus]}`}>
        <span className="text-xs font-semibold">● {STATUS_LABEL_JA[coverage.shootingStatus]}</span>
        <span className="text-[10px] uppercase">{coverage.shootingStatus}</span>
      </div>

      <Row label="Camera" value={`${cameraName} / ${sensorModeName}`} />
      <Row label="Active Sensor" value={`${sensorWidthMm.toFixed(2)} × ${sensorHeightMm.toFixed(2)} mm`} />
      <div className="my-2 border-t border-vp-border" />
      <Row label="HFOV" value={`${fov.hfovDeg.toFixed(2)}°`} />
      <Row label="VFOV" value={`${fov.vfovDeg.toFixed(2)}°`} />
      <Row label="DFOV" value={`${fov.dfovDeg.toFixed(2)}°`} />

      <div className="my-2 border-t border-vp-border" />
      <Row label="Main LED coverage" value={`${coverage.mainLEDPercent.toFixed(1)} %`} />
      <Row label="Ceiling coverage" value={`${coverage.ceilingPercent.toFixed(1)} %`} />
      <Row label="Outside LED" value={`${coverage.outsidePercent.toFixed(1)} %`} />

      <div className="my-2 border-t border-vp-border" />
      <div className="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">Frame Edges</div>
      <EdgeBadge label="TOP" status={coverage.edges.top} />
      <EdgeBadge label="BOTTOM" status={coverage.edges.bottom} />
      <EdgeBadge label="LEFT" status={coverage.edges.left} />
      <EdgeBadge label="RIGHT" status={coverage.edges.right} />

      <div className="my-2 border-t border-vp-border" />
      <div className="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">Safety</div>
      <Row label="Nearest LED distance" value={`${safety.nearestDistance.toFixed(2)} m`} />
      <Row label="Safety status" value={safety.status} />

      <div className="mt-3 text-[10px] text-neutral-600">
        Sampled {coverage.gridWidth}×{coverage.gridHeight} rays ({coverage.computeTimeMs.toFixed(1)} ms).
      </div>
    </div>
  );
}
