import { database } from "@/lib/storage/database";
import type { UserMacro } from "@/types/macro";

export async function listUserMacros() {
  return database.userMacros.orderBy("updatedAt").reverse().toArray();
}

export async function saveUserMacro(userMacro: UserMacro) {
  await database.userMacros.put(userMacro);
}

export async function deleteUserMacro(id: string) {
  await database.userMacros.delete(id);
}
