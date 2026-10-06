import { describe, expect, it } from "vitest";

import { macroTemplates } from "@/features/macro/macro-templates";

import {
  getDefaultMacroValues,
  renderMacroCode,
} from "./render-macro-template";

describe("MacroTemplate rendering", () => {
  it("uses selected ScriptLine content and configured values", () => {
    const template = macroTemplates.find(({ id }) => id === "narration");
    expect(template).toBeDefined();
    if (!template) return;

    const result = renderMacroCode(template.code, "어두운 문이 열린다.", {
      ...getDefaultMacroValues(template),
      textColor: "#ff0000",
      fontWeight: "bold",
    });

    expect(result).toContain("어두운 문이 열린다.");
    expect(result).toContain("color: #ff0000");
    expect(result).toContain("font-weight: bold");
  });

  it("keeps unknown placeholders for later editing", () => {
    expect(renderMacroCode("{{content}} {{unknown}}", "내용")).toBe(
      "내용 {{unknown}}",
    );
  });
});
