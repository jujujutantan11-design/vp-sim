import type { LensSeries } from "@/types/camera";

/**
 * ARRI Signature Prime lens series.
 *
 * IMPORTANT (spec §10F): this focal-length list is a reasonable common
 * set but is NOT confirmed as the complete official Signature Prime
 * lineup -- it has not been individually cross-checked against current
 * ARRI technical documentation, so the series is marked verified:false
 * (UNVERIFIED) at the "complete lineup" level.
 *
 * The TOEI No.11st facility documentation DOES specifically confirm two
 * focal lengths as physically available stage equipment: 18mm and
 * 125mm. Those are tracked separately via `toeiAvailableFocalLengths`
 * and use the "TOEI Equipment Only" filter (spec §10I) to distinguish
 * "exists in database" from "available at TOEI No.11st".
 */
export const ARRI_SIGNATURE_PRIME: LensSeries = {
  id: "ARRI_SIGNATURE_PRIME",
  manufacturer: "ARRI",
  series: "Signature Prime",
  type: "PRIME",
  mount: "LPL",
  focalLengths: [18, 21, 24, 25, 29, 32, 35, 40, 47, 50, 58, 65, 75, 85, 100, 125],
  toeiAvailableFocalLengths: [18, 125],
  verified: false,
  source:
    "Focal-length list assembled from general ARRI Signature Prime product info; NOT individually verified per-focal-length against current ARRI documentation. TOEI No.11st documentation confirms 18mm and 125mm specifically.",
};
