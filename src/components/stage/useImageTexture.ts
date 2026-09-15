import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const MAX_TEXTURE_DIMENSION = 2048;

/**
 * Loads an image (data URL, blob URL, or regular URL) and returns a
 * THREE.Texture backed by an ImageBitmap, downscaled to a WebGL-safe
 * size.
 *
 * IMPORTANT: this deliberately avoids drawing through a 2D
 * <canvas>/toDataURL/getImageData at any point. Several browsers
 * (notably WebKit/Safari's anti-fingerprinting protections, common on
 * iOS/iPadOS and therefore in EVERY browser on those devices, since
 * they all use WebKit) poison canvas pixel readback for privacy --
 * silently returning blank/white data instead of the real image
 * content. That exactly matches this app's symptom: the texture
 * reports as "loaded" with correct dimensions, but every surface using
 * it renders solid white regardless of the source image. Resizing via
 * `createImageBitmap({ resizeWidth, resizeHeight })` and uploading the
 * resulting ImageBitmap directly to WebGL sidesteps the 2D canvas
 * entirely.
 *
 * Disposes the PREVIOUS texture (and closes its ImageBitmap) whenever
 * a new one replaces it, or on unmount -- GPU memory is not reclaimed
 * by JS garbage collection alone.
 */
export function useImageTexture(url: string | null): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const currentRef = useRef<{ texture: THREE.Texture; bitmap: ImageBitmap } | null>(null);

  useEffect(() => {
    if (!url) {
      if (currentRef.current) {
        currentRef.current.texture.dispose();
        currentRef.current.bitmap.close();
        currentRef.current = null;
      }
      setTexture(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        // Step 1: read natural dimensions via a plain <img> (this part
        // has always worked reliably in testing, even for very large
        // source images).
        const probe = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error("failed to decode image for size probe"));
          el.src = url;
        });
        if (cancelled) return;

        const scale = Math.min(1, MAX_TEXTURE_DIMENSION / Math.max(probe.naturalWidth, probe.naturalHeight));
        const targetW = Math.max(1, Math.round(probe.naturalWidth * scale));
        const targetH = Math.max(1, Math.round(probe.naturalHeight * scale));

        // Step 2: fetch the same URL as a Blob and let createImageBitmap
        // do the resize -- no <canvas> involved anywhere in this path.
        const blob = await fetch(url).then((r) => r.blob());
        if (cancelled) return;

        const bitmap = await createImageBitmap(blob, {
          resizeWidth: targetW,
          resizeHeight: targetH,
          resizeQuality: "high",
        });
        if (cancelled) {
          bitmap.close();
          return;
        }

        console.log(
          `[useImageTexture] loaded via createImageBitmap: ${probe.naturalWidth}x${probe.naturalHeight} -> ${targetW}x${targetH}`
        );

        if (currentRef.current) {
          currentRef.current.texture.dispose();
          currentRef.current.bitmap.close();
        }

        const tex = new THREE.Texture(bitmap as unknown as ImageBitmap);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        // Uploaded images are essentially never a power-of-two size.
        // three.js's default minFilter (LinearMipmapLinearFilter)
        // requires mipmaps; forcing mipmap generation/sampling on a
        // non-power-of-two texture is a well-known way for some
        // WebGL implementations to treat the texture as "incomplete"
        // and render it as a flat fallback color (often white) even
        // though the pixel data itself is perfectly valid. Disabling
        // mipmaps and using a non-mipmap filter sidesteps this
        // entirely -- we don't need mipmaps for a single large flat
        // LED surface anyway.
        tex.generateMipmaps = false;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;

        currentRef.current = { texture: tex, bitmap };
        setTexture(tex);
      } catch (err) {
        console.error("[useImageTexture] FAILED:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    return () => {
      if (currentRef.current) {
        currentRef.current.texture.dispose();
        currentRef.current.bitmap.close();
        currentRef.current = null;
      }
    };
  }, []);

  return texture;
}
