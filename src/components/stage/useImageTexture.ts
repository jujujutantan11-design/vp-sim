import { useEffect, useState } from "react";
import * as THREE from "three";

/**
 * Uploaded LED content images can come straight from a phone/tablet
 * camera at very high resolution (e.g. 11648x8736, ~100 megapixels).
 * That comfortably exceeds typical WebGL MAX_TEXTURE_SIZE limits
 * (commonly 4096-8192 depending on GPU/browser), which causes the
 * texture upload to silently fail -- no JS-catchable error, the
 * surface just renders as a blank/solid color. All uploaded images are
 * therefore downscaled (preserving aspect ratio) to at most this many
 * pixels on the longest side before becoming a THREE texture.
 */
const MAX_TEXTURE_DIMENSION = 2048;

/**
 * Loads an image (data URL or regular URL), downscales it to a
 * WebGL-safe size via an offscreen canvas, and returns a
 * THREE.CanvasTexture. Re-loads whenever the URL changes. Returns null
 * while loading / when no URL is given -- callers fall back to their
 * solid color until ready.
 */
export function useImageTexture(url: string | null): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) {
      setTexture(null);
      return;
    }
    let cancelled = false;

    const img = new Image();
    img.onload = () => {
      if (cancelled) return;

      const { width, height } = img;
      const scale = Math.min(1, MAX_TEXTURE_DIMENSION / Math.max(width, height));
      const targetW = Math.max(1, Math.round(width * scale));
      const targetH = Math.max(1, Math.round(height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("[useImageTexture] failed to get 2D context for downscale canvas");
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);

      console.log(
        `[useImageTexture] loaded ${width}x${height}, downscaled to ${targetW}x${targetH} for WebGL safety`
      );

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.needsUpdate = true;
      setTexture(tex);
    };
    img.onerror = (err) => {
      console.error("[useImageTexture] FAILED TO LOAD IMAGE:", err);
    };
    img.src = url;

    return () => {
      cancelled = true;
    };
  }, [url]);

  return texture;
}
