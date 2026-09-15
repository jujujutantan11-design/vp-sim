/**
 * Coverage / shooting-status thresholds, centralized here rather than
 * buried inside components (spec §21). All are user-tunable in a later
 * phase via settings UI; for now these are the MVP defaults.
 */
export const COVERAGE_THRESHOLDS = {
  /**
   * Numerical tolerance for "approximately zero" OUTSIDE_LED percentage
   * that still counts as SAFE (floating point / sampling-grid noise).
   */
  safeOutsideLedPercentMax: 0.05,

  /**
   * Above this OUTSIDE_LED percentage, status becomes VIOLATION rather
   * than WARNING.
   */
  violationOutsideLedPercentMin: 2.0,

  /** Ray sampling grid used for full-quality coverage calculation. */
  fullQualitySamplingGrid: { width: 64, height: 36 },

  /** Reduced sampling grid used while dragging (throttled quality). */
  dragSamplingGrid: { width: 32, height: 18 },

  epsilon: 1e-6,
} as const;

/**
 * Safety-zone / Safe Shooting Area thresholds (spec §21, §23-27).
 * Centralized here rather than hard-coded in components.
 */
export const SAFETY_THRESHOLDS = {
  /**
   * Extra distance, beyond the hard safety-zone boundary
   * (stage.safetyZone.distance, default 1.0m), that still counts as
   * WARNING rather than fully SAFE -- gives the operator advance
   * notice before actually crossing into the exclusion zone.
   */
  warningMarginM: 0.3,
} as const;

export const SAFE_AREA_DEFAULTS = {
  /** Default grid spacing, meters (spec §23: 0.20m default). */
  gridSpacingM: 0.2,
  /** Selectable spacings offered in the UI. */
  selectableSpacingsM: [0.1, 0.2, 0.5] as const,
  /** How far beyond the Main LED radius to extend the evaluated grid, meters. */
  gridExtentPaddingM: 1.5,
  /** Reduced coverage-sampling grid used per Safe Area cell (spec §25). */
  coverageSamplingGrid: { width: 16, height: 9 },
  /** Default look-at target for LOOK_AT_STAGE_CENTER orientation mode (spec §24). */
  defaultLookAtTarget: { x: 0, y: 1.5, z: 0 },
} as const;
