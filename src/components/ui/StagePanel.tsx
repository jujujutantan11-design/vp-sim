import type { ReactNode } from "react";
import { useSimulatorStore } from "@/store/simulatorStore";
import { t } from "@/config/i18n";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className="text-neutral-400">{label}</span>
      <span className="font-mono text-neutral-100">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-vp-border px-3 py-3">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </div>
      {children}
    </div>
  );
}

export function StagePanel() {
  const stage = useSimulatorStore((s) => s.stage);
  const toggleCeilingEnabled = useSimulatorStore((s) => s.toggleCeilingEnabled);
  const showSafetyZone = useSimulatorStore((s) => s.showSafetyZone);
  const toggleSafetyZone = useSimulatorStore((s) => s.toggleSafetyZone);

  const { mainLED, ceilingLED, safetyZone } = stage;

  return (
    <div>
      <div className="border-b border-vp-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
        {t("stageSettings")}
      </div>

      <Section title={t("mainLED")}>
        <Row label={t("radius")} value={`${mainLED.radius.toFixed(3)} m`} />
        <Row label={t("diameter")} value={`${(mainLED.radius * 2).toFixed(3)} m`} />
        <Row label={t("height")} value={`${mainLED.height.toFixed(2)} m`} />
        <Row label="Support member" value={`${mainLED.supportMemberHeightM.toFixed(2)} m (from floor)`} />
        <Row label={t("arc")} value={`${mainLED.arcDegrees}°`} />
        <Row label={t("openingDirection")} value={mainLED.openingDirection} />
        <Row label="Panel" value={mainLED.panelProduct} />
        <Row label="Pitch" value={`${mainLED.pixelPitchMm} mm`} />
        <Row
          label="Resolution"
          value={`${mainLED.publishedResolution.width} × ${mainLED.publishedResolution.height}`}
        />
      </Section>

      <Section title={t("ceilingLED")}>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-neutral-400">{t("enable")}</span>
          <button
            onClick={toggleCeilingEnabled}
            className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
              ceilingLED.enabled
                ? "bg-vp-safe/20 text-vp-safe"
                : "bg-neutral-700/30 text-neutral-500"
            }`}
          >
            {ceilingLED.enabled ? "ON" : "OFF"}
          </button>
        </div>
        <Row label={t("width")} value={`${ceilingLED.width} m`} />
        <Row label={t("depth")} value={`${ceilingLED.depth} m`} />
        <Row label={t("height")} value={`${ceilingLED.height.toFixed(2)} m`} />
        <Row label="Panel" value={ceilingLED.panelProduct} />
      </Section>

      <Section title={t("safetyZone")}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400">{t("showHide")}</span>
          <button
            onClick={toggleSafetyZone}
            className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
              showSafetyZone ? "bg-vp-safe/20 text-vp-safe" : "bg-neutral-700/30 text-neutral-500"
            }`}
          >
            {showSafetyZone ? "ON" : "OFF"}
          </button>
        </div>
        <Row label="Distance" value={`${safetyZone.distance.toFixed(1)} m`} />
        <div className="mt-1 text-[10px] text-neutral-600">
          可視化は Phase 4 で実装予定 (visualization arrives in Phase 4)
        </div>
      </Section>
    </div>
  );
}
