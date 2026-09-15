import { useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import { useTextureStore } from "@/store/textureStore";
import type { FitMode } from "@/store/textureStore";
import { TEST_PATTERN_URL } from "@/components/stage/useImageTexture";

function FitModeSelect({ value, onChange }: { value: FitMode; onChange: (m: FitMode) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as FitMode)}
      className="rounded border border-vp-border bg-vp-bg px-1.5 py-0.5 text-neutral-100"
    >
      <option value="FIT">Fit</option>
      <option value="FILL">Fill</option>
      <option value="STRETCH">Stretch</option>
    </select>
  );
}

export function TexturePanel() {
  const mainLEDImageDataUrl = useTextureStore((s) => s.mainLEDImageDataUrl);
  const setMainLEDImage = useTextureStore((s) => s.setMainLEDImage);
  const mainLEDFitMode = useTextureStore((s) => s.mainLEDFitMode);
  const setMainLEDFitMode = useTextureStore((s) => s.setMainLEDFitMode);

  const ceilingLEDImageDataUrl = useTextureStore((s) => s.ceilingLEDImageDataUrl);
  const setCeilingLEDImage = useTextureStore((s) => s.setCeilingLEDImage);
  const ceilingLEDFitMode = useTextureStore((s) => s.ceilingLEDFitMode);
  const setCeilingLEDFitMode = useTextureStore((s) => s.setCeilingLEDFitMode);

  const mainInputRef = useRef<HTMLInputElement>(null);
  const ceilingInputRef = useRef<HTMLInputElement>(null);

  // Revoke blob: object URLs when they're replaced/removed, to avoid
  // leaking browser-managed memory across many uploads in one session.
  const prevMainUrl = useRef<string | null>(null);
  const prevCeilingUrl = useRef<string | null>(null);
  useEffect(() => {
    if (prevMainUrl.current && prevMainUrl.current !== mainLEDImageDataUrl) {
      URL.revokeObjectURL(prevMainUrl.current);
    }
    prevMainUrl.current = mainLEDImageDataUrl;
  }, [mainLEDImageDataUrl]);
  useEffect(() => {
    if (prevCeilingUrl.current && prevCeilingUrl.current !== ceilingLEDImageDataUrl) {
      URL.revokeObjectURL(prevCeilingUrl.current);
    }
    prevCeilingUrl.current = ceilingLEDImageDataUrl;
  }, [ceilingLEDImageDataUrl]);

  // NOTE: no canvas / toDataURL here -- just a plain object URL
  // reference to the selected File. Actual resizing to a WebGL-safe
  // size happens in useImageTexture via createImageBitmap, which does
  // not go through a 2D canvas (see that file for why that matters).
  function handleMainFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    console.log("[TexturePanel] main file selected:", file ? `${file.name} (${file.size} bytes)` : "none");
    if (!file) return;
    setMainLEDImage(URL.createObjectURL(file));
    e.target.value = "";
  }
  function handleCeilingFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCeilingLEDImage(URL.createObjectURL(file));
    e.target.value = "";
  }

  return (
    <div className="border-b border-vp-border px-3 py-3">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
        LED CONTENT
      </div>

      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-neutral-400">Main LED image</span>
          <FitModeSelect value={mainLEDFitMode} onChange={setMainLEDFitMode} />
        </div>
        <input
          ref={mainInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleMainFile}
          className="mb-1 w-full text-[10px] text-neutral-400 file:mr-2 file:rounded file:border-0 file:bg-vp-border file:px-2 file:py-1 file:text-neutral-200"
        />
        <button
          onClick={() => setMainLEDImage(TEST_PATTERN_URL)}
          className="mb-1 rounded border border-vp-accent px-2 py-0.5 text-[10px] text-vp-accent"
        >
          🔴🔵 テストパターンを表示(診断用)
        </button>
        <br />
        {mainLEDImageDataUrl && (
          <button
            onClick={() => setMainLEDImage(null)}
            className="text-[10px] text-neutral-500 underline"
          >
            画像を削除
          </button>
        )}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-neutral-400">Ceiling LED image</span>
          <FitModeSelect value={ceilingLEDFitMode} onChange={setCeilingLEDFitMode} />
        </div>
        <input
          ref={ceilingInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleCeilingFile}
          className="mb-1 w-full text-[10px] text-neutral-400 file:mr-2 file:rounded file:border-0 file:bg-vp-border file:px-2 file:py-1 file:text-neutral-200"
        />
        {ceilingLEDImageDataUrl && (
          <button
            onClick={() => setCeilingLEDImage(null)}
            className="text-[10px] text-neutral-500 underline"
          >
            画像を削除
          </button>
        )}
      </div>
    </div>
  );
}
