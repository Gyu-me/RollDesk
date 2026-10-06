import Dexie, { type EntityTable } from "dexie";

import type { Scenario } from "@/types/scenario";

class RollDeskDatabase extends Dexie {
  scenarios!: EntityTable<Scenario, "id">;

  constructor() {
    super("rolldesk");
    this.version(1).stores({
      scenarios: "id, updatedAt, createdAt",
    });
  }
}

export const database = new RollDeskDatabase();
