import { create } from "zustand";

import type { ScriptLineTag } from "@/types/scenario";

export type TagColors = Record<ScriptLineTag, string>;
export type MacroTagPreferences = Record<string, ScriptLineTag>;

export const defaultTagColors: TagColors = {
  unassigned: "#7c8495",
  narration: "#4f7fd8",
  dialogue: "#8b5cc7",
  investigation: "#3a9b75",
  check: "#c17a31",
  code: "#4f6d8f",
};

const storageKey = "rolldesk:settings";

interface SettingsStore {
  tagColors: TagColors;
  macroTagPreferences: MacroTagPreferences;
  hydrateSettings: () => void;
  setTagColor: (tag: ScriptLineTag, color: string) => void;
  setMacroTagPreference: (templateKey: string, tag: ScriptLineTag) => void;
  resetTagColors: () => void;
}

interface StoredSettings {
  tagColors?: Partial<TagColors>;
  macroTagPreferences?: Record<string, unknown>;
}

const scriptLineTagValues: ScriptLineTag[] = [
  "unassigned",
  "narration",
  "dialogue",
  "investigation",
  "check",
  "code",
];

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function isScriptLineTag(value: unknown): value is ScriptLineTag {
  return scriptLineTagValues.some((tag) => tag === value);
}

function readStoredSettings() {
  if (typeof window === "undefined") return null;

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(storageKey) ?? "null",
    ) as StoredSettings | null;
    if (!parsed) return null;

    const nextColors = { ...defaultTagColors };
    if (parsed.tagColors) {
      for (const tag of Object.keys(defaultTagColors) as ScriptLineTag[]) {
        const color = parsed.tagColors[tag];
        if (isHexColor(color)) nextColors[tag] = color;
      }
    }

    const macroTagPreferences: MacroTagPreferences = {};
    for (const [templateKey, value] of Object.entries(
      parsed.macroTagPreferences ?? {},
    )) {
      if (isScriptLineTag(value)) macroTagPreferences[templateKey] = value;
    }

    return { tagColors: nextColors, macroTagPreferences };
  } catch {
    return null;
  }
}

function writeSettings(
  tagColors: TagColors,
  macroTagPreferences: MacroTagPreferences,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    storageKey,
    JSON.stringify({ tagColors, macroTagPreferences }),
  );
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  tagColors: defaultTagColors,
  macroTagPreferences: {},

  hydrateSettings: () => {
    const settings = readStoredSettings();
    if (settings) set(settings);
  },

  setTagColor: (tag, color) => {
    if (!isHexColor(color)) return;
    const tagColors = { ...get().tagColors, [tag]: color };
    set({ tagColors });
    writeSettings(tagColors, get().macroTagPreferences);
  },

  setMacroTagPreference: (templateKey, tag) => {
    const macroTagPreferences = {
      ...get().macroTagPreferences,
      [templateKey]: tag,
    };
    set({ macroTagPreferences });
    writeSettings(get().tagColors, macroTagPreferences);
  },

  resetTagColors: () => {
    const tagColors = { ...defaultTagColors };
    set({ tagColors });
    writeSettings(tagColors, get().macroTagPreferences);
  },
}));
