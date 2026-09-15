import type { LensSeries } from "@/types/camera";

/**
 * ARRI Signature Zoom 24-75mm.
 *
 * The TOEI No.11st facility documentation confirms this exact lens as
 * available stage equipment, so this entry is marked TOEI_DOCUMENTED at
 * the series level (spec §10G, §10I).
 */
export const ARRI_SIGNATURE_ZOOM_24_75: LensSeries = {
  id: "ARRI_SIGNATURE_ZOOM_24_75",
  manufacturer: "ARRI",
  series: "Signature Zoom 24-75mm",
  type: "ZOOM",
  mount: "LPL",
  zoomRange: { min: 24, max: 75 },
  toeiAvailableFocalLengths: undefined, // continuous zoom; entire range available at TOEI
  verified: true,
  source: "TOEI_DOCUMENTED: confirmed as No.11st stage equipment in supplied facility documentation.",
};
