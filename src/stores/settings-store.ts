import { create } from "zustand";

import type { ScriptLineTag } from "@/types/scenario";

export type TagColors = Record<ScriptLineTag, string>;

export const defaultTagColors: TagColors = {
  unassigned: "#7c8495",
  narration: "#4f7fd8",
  dialogue: "#8b5cc7",
  investigation: "#3a9b75",
  check: "#c17a31",
};

const storageKey = "rolldesk:settings";

interface SettingsStore {
  tagColors: TagColors;
  hydrateSettings: () => void;
  setTagColor: (tag: ScriptLineTag, color: string) => void;
  resetTagColors: () => void;
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function readStoredTagColors(): TagColors | null {
  if (typeof window === "undefined") return null;

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(storageKey) ?? "null",
    ) as { tagColors?: Partial<TagColors> } | null;
    if (!parsed?.tagColors) return null;

    const nextColors = { ...defaultTagColors };
    for (const tag of Object.keys(defaultTagColors) as ScriptLineTag[]) {
      const color = parsed.tagColors[tag];
      if (isHexColor(color)) nextColors[tag] = color;
    }
    return nextColors;
  } catch {
    return null;
  }
}

function writeTagColors(tagColors: TagColors) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify({ tagColors }));
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  tagColors: defaultTagColors,

  hydrateSettings: () => {
    const tagColors = readStoredTagColors();
    if (tagColors) set({ tagColors });
  },

  setTagColor: (tag, color) => {
    if (!isHexColor(color)) return;
    const tagColors = { ...get().tagColors, [tag]: color };
    set({ tagColors });
    writeTagColors(tagColors);
  },

  resetTagColors: () => {
    const tagColors = { ...defaultTagColors };
    set({ tagColors });
    writeTagColors(tagColors);
  },
}));
