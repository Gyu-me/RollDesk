import { beforeEach, describe, expect, it } from "vitest";

import { defaultTagColors, useSettingsStore } from "@/stores/settings-store";

beforeEach(() => {
  window.localStorage.clear();
  useSettingsStore.setState({
    tagColors: { ...defaultTagColors },
    macroTagPreferences: {},
  });
});

describe("Settings store", () => {
  it("remembers the last selected Tag for each template", () => {
    useSettingsStore
      .getState()
      .setMacroTagPreference("built-in:narration", "investigation");
    useSettingsStore
      .getState()
      .setMacroTagPreference("built-in:divider", "code");

    useSettingsStore.setState({ macroTagPreferences: {} });
    useSettingsStore.getState().hydrateSettings();

    expect(useSettingsStore.getState().macroTagPreferences).toEqual({
      "built-in:narration": "investigation",
      "built-in:divider": "code",
    });
  });

  it("preserves template Tag preferences when Tag colors are reset", () => {
    useSettingsStore
      .getState()
      .setMacroTagPreference("built-in:narration", "dialogue");
    useSettingsStore.getState().resetTagColors();

    expect(
      useSettingsStore.getState().macroTagPreferences["built-in:narration"],
    ).toBe("dialogue");
  });
});
