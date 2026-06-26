import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SETTINGS, type AppSettings } from "./settings-defaults";
import { resolveText } from "./settings-defaults";
import type { TextKey } from "./i18n";

const CACHE_KEY = "sld_settings_cache_v1";
const PENDING_KEY = "sld_settings_pending_v1";

interface State {
  settings: AppSettings;
  loaded: boolean;
  online: boolean;
  t: (k: TextKey) => string;
  setSettings: (updater: (s: AppSettings) => AppSettings) => void;
  init: () => Promise<void>;
}

function deepMerge<T>(base: T, patch: any): T {
  if (patch === null || patch === undefined) return base;
  if (typeof base !== "object" || base === null || Array.isArray(base)) return patch as T;
  const out: any = { ...base };
  for (const k of Object.keys(patch)) {
    out[k] = deepMerge((base as any)[k], patch[k]);
  }
  return out;
}

let saveTimer: any = null;

async function pushToCloud(settings: AppSettings) {
  try {
    const { error } = await supabase
      .from("app_settings")
      .update({ data: settings as any, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) {
      // queue for retry
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(PENDING_KEY, JSON.stringify(settings));
      }
    } else if (typeof localStorage !== "undefined") {
      localStorage.removeItem(PENDING_KEY);
    }
  } catch {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(PENDING_KEY, JSON.stringify(settings));
    }
  }
}

export const useSettings = create<State>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  online: typeof navigator !== "undefined" ? navigator.onLine : true,

  t: (k) => resolveText(get().settings, k),

  setSettings: (updater) => {
    const next = updater(get().settings);
    set({ settings: next });
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(CACHE_KEY, JSON.stringify(next));
    }
    // debounce push
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => pushToCloud(next), 400);
  },

  init: async () => {
    if (get().loaded) return;

    // hydrate from cache first
    if (typeof localStorage !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          set({ settings: deepMerge(DEFAULT_SETTINGS, parsed) });
        }
      } catch {}
    }

    // load from cloud
    try {
      const { data, error } = await supabase
        .from("app_settings").select("data").eq("id", 1).maybeSingle();
      if (!error && data) {
        const merged = deepMerge(DEFAULT_SETTINGS, data.data ?? {});
        set({ settings: merged });
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
        }
      }
    } catch {}
    set({ loaded: true });

    // realtime subscription
    supabase
      .channel("app_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings", filter: "id=eq.1" },
        (payload: any) => {
          const data = payload.new?.data;
          if (data) {
            const merged = deepMerge(DEFAULT_SETTINGS, data);
            set({ settings: merged });
            if (typeof localStorage !== "undefined") {
              localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
            }
          }
        },
      )
      .subscribe();

    // online/offline sync of pending
    if (typeof window !== "undefined") {
      const flush = async () => {
        set({ online: navigator.onLine });
        const pending = localStorage.getItem(PENDING_KEY);
        if (pending && navigator.onLine) {
          try {
            await pushToCloud(JSON.parse(pending));
          } catch {}
        }
      };
      window.addEventListener("online", flush);
      window.addEventListener("offline", () => set({ online: false }));
      void flush();
    }
  },
}));
