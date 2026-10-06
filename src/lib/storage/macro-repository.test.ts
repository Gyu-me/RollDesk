import { afterEach, describe, expect, it } from "vitest";

import { database } from "@/lib/storage/database";

import {
  deleteUserMacro,
  listUserMacros,
  saveUserMacro,
} from "./macro-repository";

afterEach(async () => {
  await database.userMacros.clear();
});

describe("UserMacro repository", () => {
  it("persists, lists, and deletes user templates", async () => {
    const userMacro = {
      id: "macro_1",
      name: "내 템플릿",
      memo: "테스트",
      code: "/desc {{content}}",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    await saveUserMacro(userMacro);
    await expect(listUserMacros()).resolves.toEqual([userMacro]);

    await deleteUserMacro(userMacro.id);
    await expect(listUserMacros()).resolves.toEqual([]);
  });
});
