export type ScriptLineTag =
  "unassigned" | "narration" | "dialogue" | "investigation" | "check";

export type ScriptLineTextAlign = "left" | "center" | "right";

export interface ScriptLineStyle {
  bold: boolean;
  italic: boolean;
  textAlign: ScriptLineTextAlign;
}

export interface ScriptLine {
  id: string;
  scenarioId: string;
  order: number;
  text: string;
  tag: ScriptLineTag;
  style?: ScriptLineStyle;
}

export interface Scenario {
  id: string;
  title: string;
  sourceText: string;
  scriptLines: ScriptLine[];
  createdAt: string;
  updatedAt: string;
}

export type ScenarioSummary = Pick<
  Scenario,
  "id" | "title" | "createdAt" | "updatedAt"
>;
