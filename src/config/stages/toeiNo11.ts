import type { StageConfig } from "@/types/stage";

/**
 * TOEI TOKYO STUDIOS, No.11 Stage.
 *
 * All numeric values below are taken directly from the supplied TOEI
 * No.11st facility documentation. Do NOT alter these source values.
 *
 * Two diameter figures are documented and are NOT identical:
 *   - publishedNominalDiameter: ~12.0 m   (facility spec sheet)
 *   - drawingReferenceDiameter: 12.636 m  (detailed plan drawing, Φ12,636mm)
 *
 * Per spec §3, the initial GEOMETRIC radius used for rendering/math is
 * derived from drawingReferenceDiameter (geometryMode = "DRAWING_DIAMETER").
 * This does not imply the two figures are equivalent -- see
 * src/utils/diagnostics.ts for the discrepancy this produces against the
 * published 30 m wall width.
 */
export const TOEI_NO11_STAGE: StageConfig = {
  id: "TOEI_NO11",
  name: "TOEI No.11st",
  subtitle: "Virtual Production Camera Planning Tool",

  mainLED: {
    geometryMode: "DRAWING_DIAMETER",
    radius: 12.636 / 2, // 6.318 m -- derived from drawingReferenceDiameter
    height: 5.0,
    supportMemberHeightM: 0.06, // from facility floor; see MainLEDConfig doc
    arcDegrees: 270,
    openingDirection: "+Z",

    publishedNominalDiameter: 12.0,
    drawingReferenceDiameter: 12.636,
    publishedWallWidth: 30.0,

    panelProduct: "AOTO RM1.5",
    pixelPitchMm: 1.56,
    publishedResolution: { width: 19200, height: 3200 },

    refreshRateHz: 7680,
    brightnessNit: 1500,
    contrastRatio: "15000:1",
    weightTon: 1.5,

    source: "TOEI_DOCUMENTED",
  },

  ceilingLED: {
    enabled: true,
    width: 12,
    depth: 11,
    height: 5.06, // above platform; derived from 5.23m floor-to-ceiling-LED measurement, see CeilingLEDConfig doc
    centerX: 0,
    centerZ: 0,

    publishedMaxHeightAboveFloor: 5.2,
    publishedMaxHeightAbovePlatform: 5.1,

    panelProduct: "AOTO M3.7H",
    pixelPitchMm: 3.75,
    publishedResolution: { width: 3072, height: 2816 },

    refreshRateHz: 7680,
    brightnessNit: 5000,
    contrastRatio: "5000:1",
    weightTon: 4.0,

    source: "TOEI_DOCUMENTED",
  },

  platform: {
    height: 0.17,
  },

  safetyZone: {
    distance: 1.0,
    show: true,
  },

  reference: {
    publishedStageAreaTsubo: 34,
    publishedStageAreaSqm: 34 * 3.30578, // reference conversion only, not used in geometry
    entireStageAreaSqm: 498.9,
    entireStageAreaTsubo: 151.2,
    planDrawingScale: "1/100 (A3)",
  },
};

export type StagePresetId = typeof TOEI_NO11_STAGE.id;
