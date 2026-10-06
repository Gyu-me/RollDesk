import { create } from "zustand";

import { createScenario } from "@/features/scenario/scenario-factory";
import {
  insertScriptLineAfter,
  removeScriptLine,
  reorderScriptLines,
  splitScriptLine,
  updateScriptLineTag,
  updateScriptLineStyle,
  updateScriptLineText,
} from "@/features/scenario/script-line-editor";
import { parseScenarioText } from "@/lib/parsing/parse-scenario-text";
import {
  getScenario,
  listScenarios,
  saveScenario,
} from "@/lib/storage/scenario-repository";
import type {
  Scenario,
  ScenarioSummary,
  ScriptLineStyle,
  ScriptLineTag,
} from "@/types/scenario";

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

interface ScenarioStore {
  scenarios: ScenarioSummary[];
  activeScenario: Scenario | null;
  isLoading: boolean;
  saveStatus: SaveStatus;
  initialize: () => Promise<void>;
  createNewScenario: () => Promise<void>;
  selectScenario: (id: string) => Promise<void>;
  updateTitle: (title: string) => void;
  updateSourceText: (sourceText: string) => void;
  structureSource: () => void;
  updateScriptLine: (id: string, text: string) => void;
  updateScriptLineTag: (id: string, tag: ScriptLineTag) => void;
  updateScriptLineStyle: (
    id: string,
    changes: Partial<ScriptLineStyle>,
  ) => void;
  splitScriptLine: (id: string, offset: number) => string | null;
  insertScriptLineAfter: (id: string) => string | null;
  deleteScriptLine: (id: string) => void;
  reorderScriptLines: (activeId: string, overId: string) => void;
  saveActiveScenario: () => Promise<void>;
}

function touchScenario(
  scenario: Scenario,
  changes: Partial<Scenario>,
): Scenario {
  return {
    ...scenario,
    ...changes,
    updatedAt: new Date().toISOString(),
  };
}

function toSummary(scenario: Scenario): ScenarioSummary {
  const { id, title, createdAt, updatedAt } = scenario;
  return { id, title, createdAt, updatedAt };
}

export const useScenarioStore = create<ScenarioStore>((set, get) => ({
  scenarios: [],
  activeScenario: null,
  isLoading: true,
  saveStatus: "idle",

  initialize: async () => {
    try {
      const scenarios = await listScenarios();
      if (scenarios.length === 0) {
        const scenario = createScenario();
        await saveScenario(scenario);
        set({
          scenarios: [toSummary(scenario)],
          activeScenario: scenario,
          isLoading: false,
          saveStatus: "saved",
        });
        return;
      }

      const activeScenario = await getScenario(scenarios[0].id);
      set({
        scenarios,
        activeScenario: activeScenario ?? null,
        isLoading: false,
        saveStatus: "saved",
      });
    } catch {
      set({ isLoading: false, saveStatus: "error" });
    }
  },

  createNewScenario: async () => {
    await get().saveActiveScenario();
    const scenario = createScenario();
    await saveScenario(scenario);
    set((state) => ({
      scenarios: [toSummary(scenario), ...state.scenarios],
      activeScenario: scenario,
      saveStatus: "saved",
    }));
  },

  selectScenario: async (id) => {
    if (get().activeScenario?.id === id) return;
    await get().saveActiveScenario();
    const scenario = await getScenario(id);
    if (scenario) set({ activeScenario: scenario, saveStatus: "saved" });
  },

  updateTitle: (title) => {
    const scenario = get().activeScenario;
    if (!scenario) return;
    set({
      activeScenario: touchScenario(scenario, { title }),
      saveStatus: "dirty",
    });
  },

  updateSourceText: (sourceText) => {
    const scenario = get().activeScenario;
    if (!scenario) return;
    set({
      activeScenario: touchScenario(scenario, { sourceText }),
      saveStatus: "dirty",
    });
  },

  structureSource: () => {
    const scenario = get().activeScenario;
    if (!scenario) return;
    set({
      activeScenario: touchScenario(scenario, {
        scriptLines: parseScenarioText(scenario.sourceText, scenario.id),
      }),
      saveStatus: "dirty",
    });
  },

  updateScriptLine: (id, text) => {
    const scenario = get().activeScenario;
    if (!scenario) return;
    set({
      activeScenario: touchScenario(scenario, {
        scriptLines: updateScriptLineText(scenario.scriptLines, id, text),
      }),
      saveStatus: "dirty",
    });
  },

  updateScriptLineTag: (id, tag) => {
    const scenario = get().activeScenario;
    if (!scenario) return;
    set({
      activeScenario: touchScenario(scenario, {
        scriptLines: updateScriptLineTag(scenario.scriptLines, id, tag),
      }),
      saveStatus: "dirty",
    });
  },

  updateScriptLineStyle: (id, changes) => {
    const scenario = get().activeScenario;
    if (!scenario) return;
    set({
      activeScenario: touchScenario(scenario, {
        scriptLines: updateScriptLineStyle(scenario.scriptLines, id, changes),
      }),
      saveStatus: "dirty",
    });
  },

  splitScriptLine: (id, offset) => {
    const scenario = get().activeScenario;
    if (!scenario) return null;
    const result = splitScriptLine(scenario.scriptLines, id, offset);
    if (!result.newLineId) return null;
    set({
      activeScenario: touchScenario(scenario, { scriptLines: result.lines }),
      saveStatus: "dirty",
    });
    return result.newLineId;
  },

  insertScriptLineAfter: (id) => {
    const scenario = get().activeScenario;
    if (!scenario) return null;
    const result = insertScriptLineAfter(scenario.scriptLines, id);
    if (!result.newLineId) return null;
    set({
      activeScenario: touchScenario(scenario, { scriptLines: result.lines }),
      saveStatus: "dirty",
    });
    return result.newLineId;
  },

  deleteScriptLine: (id) => {
    const scenario = get().activeScenario;
    if (!scenario) return;
    set({
      activeScenario: touchScenario(scenario, {
        scriptLines: removeScriptLine(scenario.scriptLines, id),
      }),
      saveStatus: "dirty",
    });
  },

  reorderScriptLines: (activeId, overId) => {
    const scenario = get().activeScenario;
    if (!scenario || activeId === overId) return;
    set({
      activeScenario: touchScenario(scenario, {
        scriptLines: reorderScriptLines(scenario.scriptLines, activeId, overId),
      }),
      saveStatus: "dirty",
    });
  },

  saveActiveScenario: async () => {
    const scenario = get().activeScenario;
    if (!scenario || get().saveStatus !== "dirty") return;

    set({ saveStatus: "saving" });
    try {
      await saveScenario(scenario);
      set((state) => ({
        scenarios: [
          toSummary(scenario),
          ...state.scenarios.filter((item) => item.id !== scenario.id),
        ],
        saveStatus:
          state.activeScenario?.updatedAt === scenario.updatedAt
            ? "saved"
            : "dirty",
      }));
    } catch {
      set({ saveStatus: "error" });
    }
  },
}));
