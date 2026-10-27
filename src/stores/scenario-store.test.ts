import { beforeEach, describe, expect, it } from "vitest";

import { useScenarioStore } from "@/stores/scenario-store";
import type { Scenario } from "@/types/scenario";

const scenario: Scenario = {
  id: "scenario_1",
  title: "테스트",
  sourceText: "문이 열린다.",
  scriptLines: [
    {
      id: "line_1",
      scenarioId: "scenario_1",
      order: 0,
      text: "문이 열린다.",
      tag: "unassigned",
    },
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  useScenarioStore.setState({
    scenarios: [],
    activeScenario: structuredClone(scenario),
    isLoading: false,
    saveStatus: "saved",
  });
});

describe("Scenario macro application", () => {
  it("stores a MacroBinding and applies its Tag without replacing the model with code", () => {
    useScenarioStore.getState().applyMacroToScriptLine("line_1", {
      templateId: "narration",
      templateSource: "built-in",
      templateName: "나레이션",
      templateCode: "/desc [{{content}}]",
      fieldValues: { textColor: "#333333" },
      content: "수정된 지문",
      tag: "narration",
    });

    const activeScenario = useScenarioStore.getState().activeScenario;
    expect(activeScenario?.scriptLines[0]).toMatchObject({
      text: "수정된 지문",
      tag: "narration",
    });
    expect(activeScenario?.macroBindings?.[0]).toMatchObject({
      scriptLineId: "line_1",
      templateId: "narration",
      templateCode: "/desc [{{content}}]",
      appliedTag: "narration",
    });
  });

  it("keeps the binding Tag synchronized with manual Tag changes", () => {
    useScenarioStore.getState().applyMacroToScriptLine("line_1", {
      templateId: "narration",
      templateSource: "built-in",
      templateName: "나레이션",
      templateCode: "/desc [{{content}}]",
      fieldValues: {},
      content: "문이 열린다.",
      tag: "narration",
    });

    useScenarioStore.getState().updateScriptLineTag("line_1", "code");

    expect(
      useScenarioStore.getState().activeScenario?.macroBindings?.[0]
        ?.appliedTag,
    ).toBe("code");
  });
});
