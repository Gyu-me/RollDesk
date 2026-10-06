import { create } from "zustand";

import { createId } from "@/lib/utils/create-id";
import {
  deleteUserMacro as deleteStoredUserMacro,
  listUserMacros,
  saveUserMacro as saveStoredUserMacro,
} from "@/lib/storage/macro-repository";
import type { UserMacro, UserMacroInput } from "@/types/macro";

interface MacroStore {
  userMacros: UserMacro[];
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  saveUserMacro: (input: UserMacroInput, id?: string) => Promise<UserMacro>;
  deleteUserMacro: (id: string) => Promise<void>;
}

export const useMacroStore = create<MacroStore>((set, get) => ({
  userMacros: [],
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      set({ userMacros: await listUserMacros(), isLoading: false });
    } catch {
      set({ isLoading: false, error: "사용자 템플릿을 불러오지 못했습니다." });
    }
  },

  saveUserMacro: async (input, id) => {
    const existing = id
      ? get().userMacros.find((userMacro) => userMacro.id === id)
      : undefined;
    const now = new Date().toISOString();
    const userMacro: UserMacro = {
      id: existing?.id ?? createId("macro"),
      name: input.name.trim(),
      memo: input.memo.trim(),
      code: input.code,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await saveStoredUserMacro(userMacro);
    set((state) => ({
      userMacros: [
        userMacro,
        ...state.userMacros.filter((item) => item.id !== userMacro.id),
      ],
      error: null,
    }));
    return userMacro;
  },

  deleteUserMacro: async (id) => {
    await deleteStoredUserMacro(id);
    set((state) => ({
      userMacros: state.userMacros.filter((item) => item.id !== id),
      error: null,
    }));
  },
}));
