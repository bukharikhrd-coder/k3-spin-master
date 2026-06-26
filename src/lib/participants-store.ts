import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export interface Participant {
  id: string;
  number: string;
  name: string | null;
  department: string | null;
  photo_url: string | null;
  has_won: boolean;
}

interface State {
  participants: Participant[];
  loaded: boolean;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  generate: (count: number) => Promise<void>;
  addOne: (p: Omit<Participant, "id" | "has_won">) => Promise<void>;
  update: (id: string, patch: Partial<Participant>) => Promise<void>;
  remove: (ids: string[]) => Promise<void>;
  markWinners: (ids: string[]) => Promise<void>;
  resetCurrentRound: (ids: string[]) => Promise<void>;
  resetAll: () => Promise<void>;
}

export const useParticipants = create<State>((set, get) => ({
  participants: [],
  loaded: false,

  refresh: async () => {
    const { data, error } = await supabase
      .from("participants").select("*").order("number", { ascending: true });
    if (!error && data) set({ participants: data as Participant[], loaded: true });
  },

  init: async () => {
    if (get().loaded) return;
    await get().refresh();
    supabase
      .channel("participants_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants" },
        () => { void get().refresh(); },
      )
      .subscribe();
  },

  generate: async (count) => {
    const width = Math.max(3, String(count).length);
    const rows = Array.from({ length: count }, (_, i) => ({
      number: String(i + 1).padStart(width, "0"),
      name: null,
      department: null,
      photo_url: null,
    }));
    // wipe first
    await supabase.from("participants").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    // chunk insert
    for (let i = 0; i < rows.length; i += 500) {
      await supabase.from("participants").insert(rows.slice(i, i + 500));
    }
    await get().refresh();
  },

  addOne: async (p) => {
    await supabase.from("participants").insert([{ ...p }]);
    await get().refresh();
  },

  update: async (id, patch) => {
    await supabase.from("participants").update(patch).eq("id", id);
    await get().refresh();
  },

  remove: async (ids) => {
    await supabase.from("participants").delete().in("id", ids);
    await get().refresh();
  },

  markWinners: async (ids) => {
    await supabase.from("participants").update({ has_won: true }).in("id", ids);
    await get().refresh();
  },

  resetCurrentRound: async (ids) => {
    await supabase.from("participants").update({ has_won: false }).in("id", ids);
    await get().refresh();
  },

  resetAll: async () => {
    await supabase.from("participants").update({ has_won: false }).eq("has_won", true);
    await get().refresh();
  },
}));
