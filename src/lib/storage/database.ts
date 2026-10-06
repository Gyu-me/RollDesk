import Dexie, { type EntityTable } from "dexie";

import type { UserMacro } from "@/types/macro";
import type { Scenario } from "@/types/scenario";

class RollDeskDatabase extends Dexie {
  scenarios!: EntityTable<Scenario, "id">;
  userMacros!: EntityTable<UserMacro, "id">;

  constructor() {
    super("rolldesk");
    this.version(1).stores({
      scenarios: "id, updatedAt, createdAt",
    });
    this.version(2).stores({
      scenarios: "id, updatedAt, createdAt",
      userMacros: "id, updatedAt, createdAt, name",
    });
  }
}

export const database = new RollDeskDatabase();
