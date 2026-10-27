import { renderMacroCode } from "@/features/macro/render-macro-template";
import type { MacroBinding, ScriptLine } from "@/types/scenario";

export function transformScriptLineForRoll20(
  line: ScriptLine,
  binding: MacroBinding | undefined,
) {
  if (!binding || binding.scriptLineId !== line.id) return line.text;
  return renderMacroCode(binding.templateCode, line.text, binding.fieldValues);
}
