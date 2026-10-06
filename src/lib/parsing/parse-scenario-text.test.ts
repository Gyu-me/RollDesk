import { describe, expect, it } from "vitest";

import { parseScenarioText } from "./parse-scenario-text";

describe("parseScenarioText", () => {
  it("turns non-empty source lines into ordered ScriptLines", () => {
    const lines = parseScenarioText(
      "첫 번째 문장. 같은 줄의 두 번째 문장.\n\n  마지막 줄  \n",
      "scenario_1",
    );

    expect(lines).toHaveLength(3);
    expect(
      lines.map(({ order, text, tag, scenarioId }) => ({
        order,
        text,
        tag,
        scenarioId,
      })),
    ).toEqual([
      {
        order: 0,
        text: "첫 번째 문장.",
        tag: "unassigned",
        scenarioId: "scenario_1",
      },
      {
        order: 1,
        text: "같은 줄의 두 번째 문장.",
        tag: "unassigned",
        scenarioId: "scenario_1",
      },
      {
        order: 2,
        text: "마지막 줄",
        tag: "unassigned",
        scenarioId: "scenario_1",
      },
    ]);
  });

  it("keeps consecutive periods with the preceding sentence", () => {
    const lines = parseScenarioText(
      "잠시 정적이 흐른다... 다음 장면.",
      "scenario_1",
    );

    expect(lines.map((line) => line.text)).toEqual([
      "잠시 정적이 흐른다...",
      "다음 장면.",
    ]);
  });
});
