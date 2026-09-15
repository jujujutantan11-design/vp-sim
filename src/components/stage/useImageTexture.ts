import { useEffect, useState } from "react";
import * as THREE from "three";

/**
 * Loads a THREE.Texture from a data URL (or regular URL), re-loading
 * whenever the URL changes. Returns null while loading / when no URL is
 * given. Kept as a plain hook (rather than drei's suspense-based
 * useTexture) so LED panels can render without a Suspense boundary and
 * simply fall back to their solid color until the image is ready.
 */
export function useImageTexture(url: string | null): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) {
      setTexture(null);
      return;
    }
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(url, (tex) => {
      if (cancelled) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      setTexture(tex);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return texture;
}
