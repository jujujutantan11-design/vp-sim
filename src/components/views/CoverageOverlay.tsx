import { useEffect, useRef } from "react";
import type { CoverageResult } from "@/types/simulator";
import type { CoverageOverlayMode } from "@/store/simulatorStore";

interface CoverageOverlayProps {
  coverage: CoverageResult;
  mode: CoverageOverlayMode;
  opacity?: number;
}

const STATUS_COLORS = {
  covered: "rgba(34, 197, 94, 0.45)", // green
  outside: "rgba(239, 68, 68, 0.55)", // red
};

const HEATMAP_COLORS = {
  MAIN_LED: "rgba(34, 197, 94, 0.45)", // green
  CEILING_LED: "rgba(59, 130, 246, 0.45)", // blue
  OUTSIDE_LED: "rgba(239, 68, 68, 0.55)", // red
};

/**
 * Diagnostic overlay drawn on top of the CAMERA VIEW's rendered frame,
 * NOT a modification of the rendered background texture (spec §19).
 * Draws the same per-sample grid produced by the coverage engine
 * (src/utils/coverage.ts) as colored blocks on a 2D canvas -- cheap to
 * redraw and independent of the underlying Three.js render.
 */
export function CoverageOverlay({ coverage, mode, opacity = 1 }: CoverageOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { gridWidth, gridHeight, samples } = coverage;
    canvas.width = gridWidth;
    canvas.height = gridHeight;
    ctx.clearRect(0, 0, gridWidth, gridHeight);

    if (mode === "OFF") return;

    for (let j = 0; j < gridHeight; j++) {
      for (let i = 0; i < gridWidth; i++) {
        const surface = samples[j * gridWidth + i];
        const color =
          mode === "HEATMAP"
            ? HEATMAP_COLORS[surface]
            : surface === "OUTSIDE_LED"
              ? STATUS_COLORS.outside
              : STATUS_COLORS.covered;
        ctx.fillStyle = color;
        ctx.fillRect(i, j, 1, 1);
      }
    }
  }, [coverage, mode]);

  if (mode === "OFF") return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ imageRendering: "pixelated", opacity }}
    />
  );
}
