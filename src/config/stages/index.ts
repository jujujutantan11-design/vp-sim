import { TOEI_NO11_STAGE } from "./toeiNo11";
import type { StageConfig } from "@/types/stage";

/**
 * Stage preset registry. Adding a new physical LED stage means adding a
 * new entry here (and a new file in this directory) -- rendering
 * components must never hard-code TOEI-specific values directly.
 */
export const STAGE_PRESETS: Record<string, StageConfig> = {
  TOEI_NO11: TOEI_NO11_STAGE,
};

export const DEFAULT_STAGE_PRESET_ID = "TOEI_NO11";

export { TOEI_NO11_STAGE };
