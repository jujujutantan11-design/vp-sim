/**
 * Minimal translation dictionary architecture (spec §55). Japanese is the
 * default UI language. This is intentionally small in Phase 1 -- it will
 * grow as Phase 2+ introduce camera/lens/analysis panels. Components must
 * look up strings here rather than hard-coding translated text.
 */
export type Locale = "ja" | "en";

export const dictionary = {
  appTitle: { ja: "TOEI No.11st LEDボリュームシミュレーター", en: "TOEI No.11st LED Volume Simulator" },
  appSubtitle: { ja: "バーチャルプロダクション カメラプランニングツール", en: "Virtual Production Camera Planning Tool" },
  stageSettings: { ja: "ステージ設定", en: "Stage Settings" },
  mainLED: { ja: "メインLED", en: "Main LED" },
  ceilingLED: { ja: "天井LED", en: "Ceiling LED" },
  radius: { ja: "半径", en: "Radius" },
  diameter: { ja: "直径", en: "Diameter" },
  height: { ja: "高さ", en: "Height" },
  arc: { ja: "円弧角度", en: "Arc" },
  openingDirection: { ja: "開口方向", en: "Opening Direction" },
  enable: { ja: "有効化", en: "Enable" },
  width: { ja: "幅", en: "Width" },
  depth: { ja: "奥行き", en: "Depth" },
  safetyZone: { ja: "安全ゾーン", en: "Safety Zone" },
  showHide: { ja: "表示 / 非表示", en: "Show / Hide" },
  diagnostics: { ja: "ステージ診断", en: "Stage Diagnostics" },
  perspective: { ja: "透視図", en: "Perspective" },
  top: { ja: "上面図", en: "Top" },
  front: { ja: "正面図", en: "Front" },
  side: { ja: "側面図", en: "Side" },
  camera: { ja: "カメラ", en: "Camera" },
} as const;

export function t(key: keyof typeof dictionary, locale: Locale = "ja"): string {
  return dictionary[key][locale];
}
