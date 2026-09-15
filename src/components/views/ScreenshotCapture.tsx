import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useSimulatorStore } from "@/store/simulatorStore";

/**
 * Must be rendered INSIDE a <Canvas>. Watches
 * simulatorStore.screenshotRequested and, when set, triggers a browser
 * download of the current frame as a PNG on the next render, then
 * clears the flag. Kept as an in-canvas component (rather than an
 * imperative ref exposed outside) because the WebGL renderer/context is
 * only accessible via useThree() from inside the Canvas tree.
 */
export function ScreenshotCapture() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const requested = useSimulatorStore((s) => s.screenshotRequested);
  const clearRequest = useSimulatorStore((s) => s.clearScreenshotRequest);

  useEffect(() => {
    if (!requested) return;

    // Render one fresh frame immediately (so the capture isn't a stale
    // buffer), preserving drawing buffer requires the renderer to have
    // been created with preserveDrawingBuffer -- toDataURL right after
    // render() works without that flag in practice for most browsers,
    // but we render explicitly here to be safe either way.
    gl.render(scene, camera);

    const dataUrl = gl.domElement.toDataURL("image/png");
    const a = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    a.href = dataUrl;
    a.download = `toei-no11-screenshot-${timestamp}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    clearRequest();
  }, [requested, gl, scene, camera, clearRequest]);

  return null;
}
