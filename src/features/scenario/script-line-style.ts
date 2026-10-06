import type { ScriptLineStyle } from "@/types/scenario";

export const defaultScriptLineStyle: ScriptLineStyle = {
  bold: false,
  italic: false,
  textAlign: "left",
};

export function resolveScriptLineStyle(
  style: ScriptLineStyle | undefined,
): ScriptLineStyle {
  return style ?? defaultScriptLineStyle;
}
