import { createId } from "@/lib/utils/create-id";
import type { Scenario } from "@/types/scenario";

export function createScenario(): Scenario {
  const now = new Date().toISOString();

  return {
    id: createId("scenario"),
    title: "제목 없는 시나리오",
    sourceText: "",
    scriptLines: [],
    createdAt: now,
    updatedAt: now,
  };
}
