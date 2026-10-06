import type { MacroTemplate } from "@/types/macro";

export function getDefaultMacroValues(template: MacroTemplate) {
  return Object.fromEntries(
    template.fields.map((field) => [field.key, field.defaultValue]),
  );
}

export function renderMacroCode(
  code: string,
  content: string,
  values: Record<string, string> = {},
) {
  const replacements: Record<string, string> = { content, ...values };

  return code.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (token, key: string) =>
    Object.hasOwn(replacements, key) ? replacements[key] : token,
  );
}
