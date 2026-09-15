import { useMemo } from "react";
import { useSimulatorStore } from "@/store/simulatorStore";
import { buildStageDiagnostics } from "@/utils/ledMath";
import { t } from "@/config/i18n";

function Row({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className="text-neutral-400">{label}</span>
      <span className={`font-mono ${warn ? "text-vp-warning" : "text-neutral-100"}`}>{value}</span>
    </div>
  );
}

export function DiagnosticsPanel() {
  const stage = useSimulatorStore((s) => s.stage);
  const diagnostics = useMemo(() => buildStageDiagnostics(stage), [stage]);

  const arcDiffSignificant = Math.abs(diagnostics.arcLengthDifference) > 0.05;

  return (
    <div>
      <div className="border-b border-vp-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
        {t("diagnostics")}
      </div>

      <div className="border-b border-vp-border px-3 py-3">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          Wall Geometry
        </div>
        <Row label="Published wall width" value={`${diagnostics.publishedWallWidth.toFixed(3)} m`} />
        <Row
          label="Calculated arc length"
          value={`${diagnostics.calculatedArcLength.toFixed(3)} m`}
          warn={arcDiffSignificant}
        />
        <Row
          label="Difference"
          value={`${diagnostics.arcLengthDifference >= 0 ? "+" : ""}${diagnostics.arcLengthDifference.toFixed(3)} m`}
          warn={arcDiffSignificant}
        />
      </div>

      <div className="border-b border-vp-border px-3 py-3">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          Diameter Sources
        </div>
        <Row label="Published nominal" value={`~${diagnostics.publishedNominalDiameter.toFixed(3)} m`} />
        <Row label="Drawing reference" value={`${diagnostics.drawingReferenceDiameter.toFixed(3)} m (in use)`} />
      </div>

      <div className="border-b border-vp-border px-3 py-3">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          Main LED Resolution
        </div>
        <Row
          label="Published"
          value={`${diagnostics.mainLEDPublishedResolution.width} × ${diagnostics.mainLEDPublishedResolution.height}`}
        />
        <Row
          label="Calc. from pitch"
          value={`${diagnostics.mainLEDCalculatedResolutionFromPitch.width} × ${diagnostics.mainLEDCalculatedResolutionFromPitch.height}`}
        />
      </div>

      <div className="border-b border-vp-border px-3 py-3">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          Ceiling LED Resolution
        </div>
        <Row
          label="Published"
          value={`${diagnostics.ceilingPublishedResolution.width} × ${diagnostics.ceilingPublishedResolution.height}`}
        />
        <Row
          label="Calc. from pitch"
          value={`${diagnostics.ceilingCalculatedResolutionFromPitch.width} × ${diagnostics.ceilingCalculatedResolutionFromPitch.height}`}
        />
      </div>

      <div className="px-3 py-3 text-[10px] leading-relaxed text-neutral-600">
        Discrepancies above are inherent to the source documentation
        (spec-sheet vs. detailed plan drawing) and are intentionally not
        auto-corrected.
      </div>
    </div>
  );
}
