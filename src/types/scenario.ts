export type ScriptLineTag = "unassigned";

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
  createdAt: string;
  updatedAt: string;
}

export type ScenarioSummary = Pick<
  Scenario,
  "id" | "title" | "createdAt" | "updatedAt"
>;
