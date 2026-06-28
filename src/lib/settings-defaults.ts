import { DEFAULT_TEXTS, type LangMode, type TextKey } from "./i18n";
import bgmAsset from "@/assets/grand-ceremony-overture.mp3.asset.json";

export type WinnerDisplayMode =
  | "number"
  | "name"
  | "number_name"
  | "number_department"
  | "number_name_department"
  | "number_name_photo";

export type DecorationKey =
  | "gears" | "helmets" | "hazardStripes" | "apar" | "cones"
  | "smoke" | "dust" | "sparkles" | "stageLights"
  | "shield" | "trophy" | "confetti";

export type OrnamentPosition =
  | "tl" | "tc" | "tr"
  | "ml" | "mc" | "mr"
  | "bl" | "bc" | "br";

export interface OrnamentItem {
  id: string;
  label: string;
  url: string | null;
  position: OrnamentPosition;
  size: number;     // px
  opacity: number;  // 0-100
  enabled: boolean;
}

export interface AppSettings {
  lang: LangMode;
  /**
   * Overrides per language. Only "id" and "zh" slots are edited from the
   * admin panel — combined modes (id_zh / zh_id) are derived from those two
   * at render time. This keeps editing simple (two inputs, not four).
   */
  texts: Partial<Record<LangMode, Partial<Record<TextKey, string>>>>;
  theme: {
    primary: string;
    accent: string;
    secondary: string;
    background: string;
    glow: string;
  };
  background: {
    preset: string;
    customUrl?: string;
    brightness: number;
    blur: number;
    overlayOpacity: number;
    zoom: number;
    positionX: number;
    positionY: number;
  };
  logos: {
    company: { url: string | null; size: number; opacity: number };
    event:   { url: string | null; size: number; opacity: number };
  };
  wheel: {
    spinDurationSec: number;
    winnersPerRound: 1 | 5 | 10 | 15 | 20;
    displayMode: WinnerDisplayMode;
    showNumbersOnly: boolean;
    numbersOnlyThreshold: number;
  };
  sound: {
    muted: boolean;
    master: number;
    music: number;
    effects: number;
    bgmUrl: string | null;
    spinSfxEnabled: boolean;
    winnerSfxEnabled: boolean;
  };
  decorations: Record<DecorationKey, boolean>;
  ornaments: OrnamentItem[];
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
  sound: {
    muted: false,
    master: 80,
    music: 50,
    effects: 90,
    bgmUrl: bgmAsset.url,
    spinSfxEnabled: true,
    winnerSfxEnabled: true,
  },
  decorations: {
    gears: true, helmets: true, hazardStripes: true, apar: false,
    cones: false, smoke: true, dust: true, sparkles: true, stageLights: true,
  },
  animationSpeed: "normal",
  reducedMotion: false,
  currentRound: 1,
  operator: "Admin",
};

/**
 * Resolve a text key into the final string shown on screen.
 * Editors only fill the "id" and "zh" slots; combined language modes
 * concatenate those two with a newline so Indonesian is on top.
 */
export function resolveText(s: AppSettings, key: TextKey): string {
  const idText = (s.texts?.id?.[key]?.trim()) || DEFAULT_TEXTS.id[key];
  const zhText = (s.texts?.zh?.[key]?.trim()) || DEFAULT_TEXTS.zh[key];
  switch (s.lang) {
    case "id":    return idText;
    case "zh":    return zhText;
    case "zh_id": return `${zhText}\n${idText}`;
    case "id_zh":
    default:      return `${idText}\n${zhText}`;
  }
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
