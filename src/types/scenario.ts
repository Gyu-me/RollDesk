export type ScriptLineTag =
  "unassigned" | "narration" | "dialogue" | "investigation" | "check" | "code";

export interface MacroBinding {
  scriptLineId: string;
  platform: "roll20";
  templateId: string;
  templateSource: "built-in" | "user";
  templateName: string;
  templateCode: string;
  fieldValues: Record<string, string>;
  appliedTag: ScriptLineTag;
  updatedAt: string;
}

export interface ScriptLine {
  id: string;
  scenarioId: string;
  order: number;
  text: string;
  tag: ScriptLineTag;
}

export interface Scenario {
  id: string;
  title: string;
  sourceText: string;
  scriptLines: ScriptLine[];
  macroBindings?: MacroBinding[];
  createdAt: string;
  updatedAt: string;
}

export type ScenarioSummary = Pick<
  Scenario,
  "id" | "title" | "createdAt" | "updatedAt"
>;
