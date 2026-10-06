import { createId } from "@/lib/utils/create-id";
import type { ScriptLine } from "@/types/scenario";

function splitLineByPeriod(line: string) {
  const sentences: string[] = [];
  let start = 0;

  for (let index = 0; index < line.length; index += 1) {
    if (line[index] !== ".") continue;

    while (line[index + 1] === ".") index += 1;
    const sentence = line.slice(start, index + 1).trim();
    if (sentence) sentences.push(sentence);
    start = index + 1;
  }

  const remainder = line.slice(start).trim();
  if (remainder) sentences.push(remainder);

  return sentences;
}

export function parseScenarioText(
  sourceText: string,
  scenarioId: string,
): ScriptLine[] {
  return sourceText
    .split(/\r?\n/)
    .map((text) => text.trim())
    .filter(Boolean)
    .flatMap(splitLineByPeriod)
    .map((text, order) => ({
      id: createId("line"),
      scenarioId,
      order,
      text,
      tag: "unassigned",
    }));
}
