import { createId } from "@/lib/utils/create-id";
import type { ScriptLine, ScriptLineTag } from "@/types/scenario";

function reindexScriptLines(lines: ScriptLine[]) {
  return lines.map((line, order) => ({ ...line, order }));
}

export function updateScriptLineText(
  lines: ScriptLine[],
  id: string,
  text: string,
) {
  return lines.map((line) => (line.id === id ? { ...line, text } : line));
}

export function updateScriptLineTag(
  lines: ScriptLine[],
  id: string,
  tag: ScriptLineTag,
) {
  return lines.map((line) => (line.id === id ? { ...line, tag } : line));
}

export function splitScriptLine(
  lines: ScriptLine[],
  id: string,
  offset: number,
) {
  const index = lines.findIndex((line) => line.id === id);
  if (index < 0) return { lines, newLineId: null };

  const target = lines[index];
  const safeOffset = Math.max(0, Math.min(offset, target.text.length));
  const newLine: ScriptLine = {
    id: createId("line"),
    scenarioId: target.scenarioId,
    order: index + 1,
    text: target.text.slice(safeOffset),
    tag: target.tag,
  };
  const nextLines = [
    ...lines.slice(0, index),
    { ...target, text: target.text.slice(0, safeOffset) },
    newLine,
    ...lines.slice(index + 1),
  ];

  return { lines: reindexScriptLines(nextLines), newLineId: newLine.id };
}

export function insertScriptLineAfter(lines: ScriptLine[], id: string) {
  const index = lines.findIndex((line) => line.id === id);
  if (index < 0) return { lines, newLineId: null };

  const target = lines[index];
  const newLine: ScriptLine = {
    id: createId("line"),
    scenarioId: target.scenarioId,
    order: index + 1,
    text: "",
    tag: "unassigned",
  };

  return {
    lines: reindexScriptLines([
      ...lines.slice(0, index + 1),
      newLine,
      ...lines.slice(index + 1),
    ]),
    newLineId: newLine.id,
  };
}

export function removeScriptLine(lines: ScriptLine[], id: string) {
  return reindexScriptLines(lines.filter((line) => line.id !== id));
}
