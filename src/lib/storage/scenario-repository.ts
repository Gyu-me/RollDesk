import { database } from "@/lib/storage/database";
import type { Scenario, ScenarioSummary } from "@/types/scenario";

export async function listScenarios(): Promise<ScenarioSummary[]> {
  const scenarios = await database.scenarios
    .orderBy("updatedAt")
    .reverse()
    .toArray();

  return scenarios.map(({ id, title, createdAt, updatedAt }) => ({
    id,
    title,
    createdAt,
    updatedAt,
  }));
}

export async function getScenario(id: string) {
  return database.scenarios.get(id);
}

export async function saveScenario(scenario: Scenario) {
  await database.scenarios.put(scenario);
}
