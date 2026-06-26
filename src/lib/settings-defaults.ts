import { DEFAULT_TEXTS, type LangMode, type TextKey } from "./i18n";

export type WinnerDisplayMode =
  | "number"
  | "name"
  | "number_name"
  | "number_department"
  | "number_name_department"
  | "number_name_photo";

export type DecorationKey =
  | "gears" | "helmets" | "hazardStripes" | "apar" | "cones"
  | "smoke" | "dust" | "sparkles" | "stageLights";

export interface AppSettings {
  lang: LangMode;
  texts: Partial<Record<LangMode, Partial<Record<TextKey, string>>>>;
  theme: {
    primary: string;       // safety blue
    accent: string;        // safety yellow
    secondary: string;     // safety orange
    background: string;    // base bg color
    glow: string;
  };
  background: {
    preset: string;        // "industrial" | custom url
    customUrl?: string;
    brightness: number;    // 0..200 (%)
    blur: number;          // 0..30 (px)
    overlayOpacity: number;// 0..100 (%)
    zoom: number;          // 80..150 (%)
    positionX: number;     // -50..50
    positionY: number;     // -50..50
  };
  logos: {
    company: { url: string | null; size: number; opacity: number };
    event:   { url: string | null; size: number; opacity: number };
  };
  wheel: {
    spinDurationSec: number;       // 5..10
    winnersPerRound: 1 | 5 | 10 | 15 | 20;
    displayMode: WinnerDisplayMode;
    showNumbersOnly: boolean;      // auto when crowded
    numbersOnlyThreshold: number;  // segment count
  };
  sound: {
    muted: boolean;
    master: number;   // 0..100
    music: number;
    effects: number;
    bgmUrl: string | null;
  };
  decorations: Record<DecorationKey, boolean>;
  animationSpeed: "slow" | "normal" | "fast";
  reducedMotion: boolean;
  currentRound: number;
  operator: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  lang: "id_zh",
  texts: {},
  theme: {
    primary: "#0B5ED7",
    accent: "#FFC107",
    secondary: "#FF7A00",
    background: "#0a1024",
    glow: "#FFC107",
  },
  background: {
    preset: "industrial",
    brightness: 65,
    blur: 2,
    overlayOpacity: 55,
    zoom: 105,
    positionX: 0,
    positionY: 0,
  },
  logos: {
    company: { url: null, size: 80, opacity: 100 },
    event:   { url: null, size: 96, opacity: 100 },
  },
  wheel: {
    spinDurationSec: 7,
    winnersPerRound: 1,
    displayMode: "number_name",
    showNumbersOnly: true,
    numbersOnlyThreshold: 60,
  },
  sound: { muted: false, master: 80, music: 50, effects: 90, bgmUrl: null },
  decorations: {
    gears: true, helmets: true, hazardStripes: true, apar: false,
    cones: false, smoke: true, dust: true, sparkles: true, stageLights: true,
  },
  animationSpeed: "normal",
  reducedMotion: false,
  currentRound: 1,
  operator: "Admin",
};

export function resolveText(s: AppSettings, key: TextKey): string {
  const override = s.texts?.[s.lang]?.[key];
  if (override && override.trim()) return override;
  return DEFAULT_TEXTS[s.lang][key];
}

export const BACKGROUND_PRESETS = [
  { id: "industrial", label: "Industrial Factory" },
  { id: "refinery", label: "Oil Refinery" },
  { id: "construction", label: "Construction Site" },
  { id: "mining", label: "Mining Area" },
  { id: "warehouse", label: "Warehouse" },
  { id: "control", label: "Control Room" },
  { id: "stage", label: "Celebration Stage" },
] as const;
