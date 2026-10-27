import type { ScriptLineTag } from "@/types/scenario";

export type MacroCategoryId =
  "basic" | "roll" | "info" | "decorate" | "scene" | "custom";

export type MacroFieldType = "text" | "color" | "select";

export type MacroPreviewKind =
  | "narration"
  | "speech"
  | "dice"
  | "judgement"
  | "thin-two-lines"
  | "thin-one-line"
  | "kpc-pc"
  | "writer"
  | "background-highlight"
  | "blur"
  | "divider";

export interface MacroFieldOption {
  label: string;
  value: string;
}

export interface MacroField {
  key: string;
  label: string;
  type: MacroFieldType;
  defaultValue: string;
  options?: MacroFieldOption[];
}

export interface MacroTemplate {
  id: string;
  categoryId: Exclude<MacroCategoryId, "custom">;
  order: number;
  name: string;
  memo: string;
  previewText: string;
  keywords: string[];
  platform: "roll20";
  defaultTag: ScriptLineTag;
  previewKind: MacroPreviewKind;
  code: string;
  fields: MacroField[];
}

export interface UserMacro {
  id: string;
  name: string;
  memo: string;
  code: string;
  defaultTag?: ScriptLineTag;
  createdAt: string;
  updatedAt: string;
}

export interface UserMacroInput {
  name: string;
  memo: string;
  code: string;
  defaultTag: ScriptLineTag;
}

export interface ApplyMacroInput {
  templateId: string;
  templateSource: "built-in" | "user";
  templateName: string;
  templateCode: string;
  fieldValues: Record<string, string>;
  content: string;
  tag: ScriptLineTag;
}
