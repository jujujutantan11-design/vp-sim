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
