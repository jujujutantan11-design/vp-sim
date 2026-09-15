import { useEffect, useState } from "react";
import * as THREE from "three";

/**
 * Loads a THREE.Texture from a data URL (or regular URL), re-loading
 * whenever the URL changes. Returns null while loading / when no URL is
 * given. Kept as a plain hook (rather than drei's suspense-based
 * useTexture) so LED panels can render without a Suspense boundary and
 * simply fall back to their solid color until the image is ready.
 *
 * DIAGNOSTIC LOGGING: temporarily logs load success/failure and image
 * dimensions to the console (prefixed "[useImageTexture]") to help
 * track down a rendering issue where textured surfaces appear solid
 * white regardless of image content. Safe to remove once resolved.
 */
export function useImageTexture(url: string | null): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) {
      setTexture(null);
      return;
    }
    let cancelled = false;
    console.log("[useImageTexture] loading, url length:", url.length, "prefix:", url.slice(0, 30));
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        const img = tex.image as HTMLImageElement | undefined;
        console.log("[useImageTexture] loaded OK. width:", img?.width, "height:", img?.height, "complete:", img?.complete);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.needsUpdate = true;
        setTexture(tex);
      },
      undefined,
      (err) => {
        console.error("[useImageTexture] FAILED TO LOAD:", err);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [url]);

  return texture;
}
