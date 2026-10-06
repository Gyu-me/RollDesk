import type { ScriptLineTag } from "@/types/scenario";

interface ScriptLineTagDefinition {
  value: ScriptLineTag;
  label: string;
  description: string;
}

export const scriptLineTags: ScriptLineTagDefinition[] = [
  {
    value: "unassigned",
    label: "미지정",
    description: "아직 역할을 정하지 않은 줄",
  },
  {
    value: "narration",
    label: "지문",
    description: "장면과 상황을 설명하는 문장",
  },
  {
    value: "dialogue",
    label: "대사",
    description: "NPC 또는 인물의 발화",
  },
  {
    value: "investigation",
    label: "조사",
    description: "플레이어가 확인할 수 있는 정보",
  },
  {
    value: "check",
    label: "판정",
    description: "주사위 판정과 조건 안내",
  },
];

export function getScriptLineTagDefinition(tag: ScriptLineTag) {
  return (
    scriptLineTags.find((definition) => definition.value === tag) ??
    scriptLineTags[0]
  );
}
