import { useCameraStore } from "@/store/cameraStore";
import { LENS_SERIES, TOEI_NO11_EQUIPMENT } from "@/config/lenses";

const QUICK_FOCAL_LENGTHS = [18, 21, 24, 25, 29, 32, 35, 40, 47, 50, 58, 65, 75, 85, 100, 125];

export function LensPanel() {
  const lens = useCameraStore((s) => s.lens);
  const setLensSeries = useCameraStore((s) => s.setLensSeries);
  const setFocalLength = useCameraStore((s) => s.setFocalLength);
  const toeiEquipmentOnly = useCameraStore((s) => s.toeiEquipmentOnly);
  const toggleToeiEquipmentOnly = useCameraStore((s) => s.toggleToeiEquipmentOnly);

  const series = LENS_SERIES[lens.lensSeriesId];
  const isZoom = series?.type === "ZOOM";
  const min = isZoom ? series!.zoomRange!.min : Math.min(...(series?.focalLengths ?? [18]));
  const max = isZoom ? series!.zoomRange!.max : Math.max(...(series?.focalLengths ?? [125]));

  const availableSeries = toeiEquipmentOnly
    ? Object.values(LENS_SERIES).filter((s) => TOEI_NO11_EQUIPMENT.lensSeries.includes(s.id))
    : Object.values(LENS_SERIES);

  return (
    <div className="border-b border-vp-border px-3 py-3">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
        LENS
      </div>

      <label className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-neutral-400">Series</span>
        <select
          value={lens.lensSeriesId}
          onChange={(e) => {
            const newSeries = LENS_SERIES[e.target.value];
            setLensSeries(e.target.value);
            const clamped = newSeries.type === "ZOOM"
              ? Math.min(Math.max(lens.focalLengthMm, newSeries.zoomRange!.min), newSeries.zoomRange!.max)
              : (newSeries.focalLengths ?? [24])[0];
            setFocalLength(clamped);
          }}
          className="rounded border border-vp-border bg-vp-bg px-1.5 py-0.5 text-neutral-100"
        >
          {availableSeries.map((s) => (
            <option key={s.id} value={s.id}>
              {s.series}
            </option>
          ))}
        </select>
      </label>

      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-neutral-400">Focal Length</span>
        <span className="font-mono text-neutral-100">{lens.focalLengthMm.toFixed(1)} mm</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={isZoom ? 1 : 1}
        value={lens.focalLengthMm}
        onChange={(e) => setFocalLength(parseFloat(e.target.value))}
        className="mb-2 w-full accent-vp-accent"
      />

      {!isZoom && (
        <div className="mb-2 grid grid-cols-4 gap-1">
          {QUICK_FOCAL_LENGTHS.map((f) => {
            const isToei = series?.toeiAvailableFocalLengths?.includes(f);
            return (
              <button
                key={f}
                onClick={() => setFocalLength(f)}
                className={`rounded border px-1 py-1 text-[10px] font-mono ${
                  lens.focalLengthMm === f
                    ? "border-vp-accent bg-vp-accent/20 text-vp-accent"
                    : "border-vp-border bg-vp-bg text-neutral-400"
                }`}
                title={isToei ? "TOEI No.11st equipment" : "Database only"}
              >
                {f}
                {isToei ? "●" : ""}
              </button>
            );
          })}
        </div>
      )}

      <label className="mt-1 flex items-center justify-between text-xs">
        <span className="text-neutral-400">11st常設機材のみ</span>
        <button
          onClick={toggleToeiEquipmentOnly}
          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
            toeiEquipmentOnly ? "bg-vp-safe/20 text-vp-safe" : "bg-neutral-700/30 text-neutral-500"
          }`}
        >
          {toeiEquipmentOnly ? "ON" : "OFF"}
        </button>
      </label>
      <div className="mt-1 text-[10px] text-neutral-600">
        {series?.verified ? "✓ " : "● "}
        {series?.source}
      </div>
    </div>
  );
}
