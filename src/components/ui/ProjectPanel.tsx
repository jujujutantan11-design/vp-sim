import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useSimulatorStore } from "@/store/simulatorStore";
import { downloadProjectFile, loadProjectFileFromFile } from "@/utils/projectFile";

export function ProjectPanel() {
  const requestScreenshot = useSimulatorStore((s) => s.requestScreenshot);
  const viewMode = useSimulatorStore((s) => s.viewMode);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [shotName, setShotName] = useState("toei-no11-shot-001");

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await loadProjectFileFromFile(file);
      setImportError(null);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "読み込みに失敗しました");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="border-b border-vp-border px-3 py-3">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
        PROJECT
      </div>

      <label className="mb-1.5 block text-xs">
        <span className="mb-1 block text-neutral-400">Shot name</span>
        <input
          value={shotName}
          onChange={(e) => setShotName(e.target.value)}
          className="w-full rounded border border-vp-border bg-vp-bg px-1.5 py-1 font-mono text-xs text-neutral-100"
        />
      </label>

      <button
        onClick={() => downloadProjectFile(shotName)}
        className="mb-1.5 w-full rounded bg-vp-border px-2 py-1.5 text-xs font-semibold text-neutral-100"
      >
        設定をJSONで保存
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="mb-1.5 w-full rounded bg-vp-border px-2 py-1.5 text-xs font-semibold text-neutral-100"
      >
        JSONから読み込み
      </button>
      <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
      {importError && <div className="mb-1.5 text-[10px] text-vp-violation">{importError}</div>}

      <button
        onClick={requestScreenshot}
        disabled={viewMode === "CAMERA"}
        className="w-full rounded bg-vp-accent px-2 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
        title={viewMode === "CAMERA" ? "3Dステージビューで使用できます" : undefined}
      >
        スクリーンショットを保存
      </button>
      {viewMode === "CAMERA" && (
        <div className="mt-1 text-[10px] text-neutral-600">
          カメラビューでのスクリーンショットは未対応です。ステージビューに切り替えてください。
        </div>
      )}
    </div>
  );
}
