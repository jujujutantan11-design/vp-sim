import { useSimulatorStore } from "@/store/simulatorStore";
import type { ViewMode, CoverageOverlayMode } from "@/store/simulatorStore";
import { useCameraStore } from "@/store/cameraStore";
import { useSafeAreaStore } from "@/store/safeAreaStore";
import type { OrientationMode } from "@/types/simulator";

/**
 * Project save format (spec §47). Deliberately excludes embedded LED
 * content images (data URLs) to keep project files small and portable
 * -- content is re-attached separately per shot, not baked into the
 * shot file. Version bump this number on any breaking schema change.
 */
export interface ProjectFile {
  version: 1;
  stagePreset: string;
  stageOverrides: {
    ceilingHeight: number;
    ceilingEnabled: boolean;
  };
  camera: {
    preset: string;
    sensorMode: string;
    position: { x: number; y: number; z: number };
    pan: number;
    tilt: number;
    roll: number;
  };
  lens: {
    series: string;
    focalLength: number;
  };
  view: {
    viewMode: string;
    coverageOverlayMode: string;
    showSafetyZone: boolean;
  };
  safeAreaSettings: {
    orientationMode: string;
    gridSpacingM: number;
  };
}

/** Builds a ProjectFile snapshot from the current Zustand stores. */
export function buildProjectFile(): ProjectFile {
  const sim = useSimulatorStore.getState();
  const cam = useCameraStore.getState();
  const safeArea = useSafeAreaStore.getState();

  return {
    version: 1,
    stagePreset: sim.stagePresetId,
    stageOverrides: {
      ceilingHeight: sim.stage.ceilingLED.height,
      ceilingEnabled: sim.stage.ceilingLED.enabled,
    },
    camera: {
      preset: cam.camera.cameraPresetId,
      sensorMode: cam.camera.sensorModeId,
      position: { x: cam.camera.positionX, y: cam.camera.positionY, z: cam.camera.positionZ },
      pan: cam.camera.pan,
      tilt: cam.camera.tilt,
      roll: cam.camera.roll,
    },
    lens: {
      series: cam.lens.lensSeriesId,
      focalLength: cam.lens.focalLengthMm,
    },
    view: {
      viewMode: sim.viewMode,
      coverageOverlayMode: sim.coverageOverlayMode,
      showSafetyZone: sim.showSafetyZone,
    },
    safeAreaSettings: {
      orientationMode: safeArea.orientationMode,
      gridSpacingM: safeArea.gridSpacingM,
    },
  };
}

/** Applies a loaded ProjectFile back onto the Zustand stores. */
export function applyProjectFile(project: ProjectFile): void {
  const sim = useSimulatorStore.getState();
  const cam = useCameraStore.getState();
  const safeArea = useSafeAreaStore.getState();

  sim.setStagePreset(project.stagePreset);
  sim.setCeilingHeight(project.stageOverrides.ceilingHeight);
  if (sim.stage.ceilingLED.enabled !== project.stageOverrides.ceilingEnabled) {
    sim.toggleCeilingEnabled();
  }

  cam.setCameraPreset(project.camera.preset);
  cam.setSensorMode(project.camera.sensorMode);
  cam.setPosition(project.camera.position.x, project.camera.position.y, project.camera.position.z);
  cam.setPan(project.camera.pan);
  cam.setTilt(project.camera.tilt);
  cam.setRoll(project.camera.roll);

  cam.setLensSeries(project.lens.series);
  cam.setFocalLength(project.lens.focalLength);

  sim.setViewMode(project.view.viewMode as ViewMode);
  sim.setCoverageOverlayMode(project.view.coverageOverlayMode as CoverageOverlayMode);
  if (sim.showSafetyZone !== project.view.showSafetyZone) {
    sim.toggleSafetyZone();
  }

  safeArea.setOrientationMode(project.safeAreaSettings.orientationMode as OrientationMode);
  safeArea.setGridSpacingM(project.safeAreaSettings.gridSpacingM);
}

/** Triggers a browser download of the current project as JSON. */
export function downloadProjectFile(filename: string): void {
  const project = buildProjectFile();
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Reads a File (from an <input type=file>) and applies it as a project. */
export function loadProjectFileFromFile(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as ProjectFile;
        applyProjectFile(parsed);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
