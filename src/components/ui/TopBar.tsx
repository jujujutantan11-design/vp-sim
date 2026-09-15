import { useSimulatorStore } from "@/store/simulatorStore";
import type { ViewMode } from "@/store/simulatorStore";
import { t } from "@/config/i18n";

const VIEW_BUTTONS: { mode: ViewMode; label: keyof typeof import("@/config/i18n").dictionary }[] = [
  { mode: "PERSPECTIVE", label: "perspective" },
  { mode: "TOP", label: "top" },
  { mode: "FRONT", label: "front" },
  { mode: "SIDE", label: "side" },
  { mode: "CAMERA", label: "camera" },
];

export function TopBar() {
  const viewMode = useSimulatorStore((s) => s.viewMode);
  const setViewMode = useSimulatorStore((s) => s.setViewMode);
  const stage = useSimulatorStore((s) => s.stage);

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-vp-border bg-vp-panel px-4">
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-neutral-100">{t("appTitle")}</span>
        <span className="text-[10px] text-neutral-500">{t("appSubtitle")}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded border border-vp-border bg-vp-bg px-2 py-1 text-[11px] text-neutral-400">
          {stage.name}
        </span>
        <div className="flex overflow-hidden rounded border border-vp-border">
          {VIEW_BUTTONS.map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-xs transition-colors ${
                viewMode === mode
                  ? "bg-vp-accent text-white"
                  : "bg-vp-bg text-neutral-400 hover:bg-vp-border"
              }`}
            >
              {t(label)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
