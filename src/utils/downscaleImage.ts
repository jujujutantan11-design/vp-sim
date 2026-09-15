/**
 * Downscales an uploaded image FILE (once, at upload time) to at most
 * `maxDimension` pixels on the longest side, returning a JPEG data URL.
 *
 * This must happen exactly once, here, rather than in each consumer of
 * the resulting image (e.g. once per <Canvas> that renders it) --
 * otherwise every consumer independently decodes the full-resolution
 * original (a phone/tablet camera photo can be 100+ megapixels,
 * ~25MB as a base64 data URL) into memory at the same time, which is
 * enough to exhaust GPU/browser memory and crash the WebGL context
 * ("Context Lost") on constrained devices.
 */
export function downscaleImageFile(file: File, maxDimension: number = 2048): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get 2D canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
