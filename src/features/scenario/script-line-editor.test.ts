import { describe, expect, it } from "vitest";

import type { ScriptLine } from "@/types/scenario";

import {
  insertScriptLineAfter,
  removeScriptLine,
  reorderScriptLines,
  splitScriptLine,
  updateScriptLineTag,
  updateScriptLineStyle,
  updateScriptLineText,
} from "./script-line-editor";

const lines: ScriptLine[] = [
  {
    id: "line_1",
    scenarioId: "scenario_1",
    order: 0,
    text: "앞부분뒷부분",
    tag: "unassigned",
  },
  {
    id: "line_2",
    scenarioId: "scenario_1",
    order: 1,
    text: "두 번째 줄",
    tag: "unassigned",
  },
];

describe("ScriptLine editing", () => {
  it("updates a line without changing its identity", () => {
    const result = updateScriptLineText(lines, "line_1", "수정된 줄");
    expect(result[0]).toMatchObject({ id: "line_1", text: "수정된 줄" });
  });

  it("assigns a domain tag to a line", () => {
    const result = updateScriptLineTag(lines, "line_1", "dialogue");
    expect(result[0]).toMatchObject({ id: "line_1", tag: "dialogue" });
    expect(result[1]).toMatchObject({ id: "line_2", tag: "unassigned" });
  });

  it("updates line-level style while filling legacy defaults", () => {
    const result = updateScriptLineStyle(lines, "line_1", {
      bold: true,
      textAlign: "center",
    });

    expect(result[0]?.style).toEqual({
      bold: true,
      italic: false,
      textAlign: "center",
    });
    expect(result[1]?.style).toBeUndefined();
  });

  it("splits a line at the requested cursor offset", () => {
    const result = splitScriptLine(lines, "line_1", 3);
    expect(result.lines.map((line) => line.text)).toEqual([
      "앞부분",
      "뒷부분",
      "두 번째 줄",
    ]);
    expect(result.lines.map((line) => line.order)).toEqual([0, 1, 2]);
  });

  it("inserts and removes lines while preserving order", () => {
    const inserted = insertScriptLineAfter(lines, "line_1");
    expect(inserted.lines.map((line) => line.text)).toEqual([
      "앞부분뒷부분",
      "",
      "두 번째 줄",
    ]);

    const removed = removeScriptLine(inserted.lines, inserted.newLineId ?? "");
    expect(removed.map((line) => line.order)).toEqual([0, 1]);
  });

  it("reorders lines and recalculates their order", () => {
    const result = reorderScriptLines(lines, "line_2", "line_1");

    expect(result.map((line) => line.id)).toEqual(["line_2", "line_1"]);
    expect(result.map((line) => line.order)).toEqual([0, 1]);
  });
});
