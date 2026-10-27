import { describe, expect, it } from "vitest";

import { transformScriptLineForRoll20 } from "./roll20-transformer";

describe("Roll20 Transformer", () => {
  const line = {
    id: "line_1",
    scenarioId: "scenario_1",
    order: 0,
    text: "문이 열린다.",
    tag: "narration" as const,
  };

  it("keeps an unbound ScriptLine platform-independent", () => {
    expect(transformScriptLineForRoll20(line, undefined)).toBe("문이 열린다.");
  });

  it("renders a bound ScriptLine with its saved template snapshot", () => {
    expect(
      transformScriptLineForRoll20(line, {
        scriptLineId: "line_1",
        platform: "roll20",
        templateId: "narration",
        templateSource: "built-in",
        templateName: "나레이션",
        templateCode: "/desc [{{content}}] {{textColor}}",
        fieldValues: { textColor: "#333333" },
        appliedTag: "narration",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    ).toBe("/desc [문이 열린다.] #333333");
  });
});
