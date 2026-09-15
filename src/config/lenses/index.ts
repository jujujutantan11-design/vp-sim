import type { LensSeries } from "@/types/camera";
import { ARRI_SIGNATURE_PRIME } from "./arriSignaturePrime";
import { ARRI_SIGNATURE_ZOOM_24_75 } from "./arriSignatureZoom";

export const LENS_SERIES: Record<string, LensSeries> = {
  ARRI_SIGNATURE_PRIME: ARRI_SIGNATURE_PRIME,
  ARRI_SIGNATURE_ZOOM_24_75: ARRI_SIGNATURE_ZOOM_24_75,
};

export const DEFAULT_LENS_SERIES_ID = "ARRI_SIGNATURE_ZOOM_24_75";
export const DEFAULT_FOCAL_LENGTH_MM = 24;

/** Equipment confirmed present at TOEI No.11st (spec §10I). */
export const TOEI_NO11_EQUIPMENT = {
  camera: "ARRI_ALEXA_35",
  lensSeries: ["ARRI_SIGNATURE_ZOOM_24_75", "ARRI_SIGNATURE_PRIME"],
  tracking: "Mo-Sys StarTracker Classic",
};

export { ARRI_SIGNATURE_PRIME, ARRI_SIGNATURE_ZOOM_24_75 };
