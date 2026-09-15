import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const MAX_TEXTURE_DIMENSION = 2048;

/**
 * Loads an image (data URL or regular URL), downscales it to a
 * WebGL-safe size via an offscreen canvas, and returns a
 * THREE.CanvasTexture. Re-loads whenever the URL changes. Returns null
 * while loading / when no URL is given -- callers fall back to their
 * solid color until ready.
 *
 * Disposes the PREVIOUS texture whenever a new one replaces it (or on
 * unmount) -- GPU-side texture memory is not reclaimed by JS garbage
 * collection alone, and leaving old textures undisposed across many
 * uploads/re-renders is a real way to exhaust GPU memory and crash the
 * WebGL context ("Context Lost") even for later, small allocations.
 */
export function useImageTexture(url: string | null): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const currentTextureRef = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) {
      if (currentTextureRef.current) {
        currentTextureRef.current.dispose();
        currentTextureRef.current = null;
      }
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

      // Dispose the texture this one is replacing, if any.
      if (currentTextureRef.current) {
        currentTextureRef.current.dispose();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.needsUpdate = true;

      currentTextureRef.current = tex;
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

  // Dispose on unmount.
  useEffect(() => {
    return () => {
      if (currentTextureRef.current) {
        currentTextureRef.current.dispose();
        currentTextureRef.current = null;
      }
    };
  }, []);

  return texture;
}
