import type { CSSProperties, ReactNode } from "react";

import type { MacroTemplate } from "@/types/macro";

interface MacroTemplatePreviewProps {
  template: MacroTemplate;
  content: string;
  values: Record<string, string>;
  compact?: boolean;
}

function valueOf(
  template: MacroTemplate,
  values: Record<string, string>,
  key: string,
) {
  return (
    values[key] ??
    template.fields.find((field) => field.key === key)?.defaultValue ??
    ""
  );
}

export function MacroTemplatePreview({
  template,
  content,
  values,
  compact = false,
}: MacroTemplatePreviewProps) {
  const previewContent = content || template.previewText;
  const frameClassName = compact
    ? "border-border bg-background flex h-12 w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-lg border px-1.5 text-center text-[0.58rem] leading-tight"
    : "border-border bg-background flex min-h-32 w-full items-center justify-center overflow-hidden rounded-xl border p-5 text-center";
  const textClassName = compact
    ? "line-clamp-3 max-w-full"
    : "line-clamp-4 max-w-full";
  let preview: ReactNode;

  switch (template.previewKind) {
    case "narration":
      preview = (
        <p
          className={textClassName}
          style={
            {
              color: valueOf(template, values, "textColor"),
              fontFamily: `${valueOf(template, values, "fontFamily")}, sans-serif`,
              fontWeight: valueOf(template, values, "fontWeight"),
              fontStyle: valueOf(template, values, "fontStyle"),
            } as CSSProperties
          }
        >
          {previewContent}
        </p>
      );
      break;
    case "speech":
      preview = (
        <p className={textClassName}>
          <strong>{valueOf(template, values, "speaker")}</strong>
          {compact ? ": " : " · "}
          {previewContent}
        </p>
      );
      break;
    case "dice":
      preview = (
        <span className="font-mono font-semibold">
          1d{valueOf(template, values, "diceSides")}
        </span>
      );
      break;
    case "judgement":
      preview = (
        <span
          className={`max-w-full truncate rounded-full font-semibold text-white shadow-sm ${
            compact ? "px-2 py-1 text-[0.5rem]" : "px-5 py-2 text-sm"
          }`}
          style={{
            backgroundImage: `linear-gradient(135deg, ${valueOf(
              template,
              values,
              "gradientStart",
            )}, ${valueOf(template, values, "gradientEnd")})`,
          }}
        >
          ✷ {previewContent} 판정 ✷
        </span>
      );
      break;
    case "thin-two-lines":
      preview = (
        <div
          className={textClassName}
          style={{ color: valueOf(template, values, "textColor") }}
        >
          <p>{previewContent}</p>
          <p className={compact ? "mt-0.5" : "mt-1 text-xs"}>
            {valueOf(template, values, "secondLine")}
          </p>
        </div>
      );
      break;
    case "thin-one-line":
      preview = (
        <p
          className={textClassName}
          style={{ color: valueOf(template, values, "textColor") }}
        >
          {previewContent}
        </p>
      );
      break;
    case "kpc-pc":
      preview = (
        <p className={textClassName}>
          <strong style={{ color: valueOf(template, values, "accentColor") }}>
            KPC
          </strong>{" "}
          {valueOf(template, values, "kpcName")}
          {compact ? " / " : "　"}
          <strong style={{ color: valueOf(template, values, "accentColor") }}>
            PC
          </strong>{" "}
          {valueOf(template, values, "pcName")}
        </p>
      );
      break;
    case "writer":
      preview = (
        <p className={textClassName}>
          <span style={{ color: valueOf(template, values, "accentColor") }}>
            Written by
          </span>{" "}
          {previewContent}
        </p>
      );
      break;
    case "background-highlight":
      preview = (
        <p
          className={`max-w-full rounded-md px-3 py-2 ${textClassName}`}
          style={{
            color: valueOf(template, values, "textColor"),
            backgroundColor: valueOf(template, values, "backgroundColor"),
          }}
        >
          {previewContent}
        </p>
      );
      break;
    case "blur":
      preview = (
        <p
          className={textClassName}
          style={{
            color: "transparent",
            textShadow: compact
              ? "0 0 4px currentColor"
              : "0 0 7px #111, 0 0 10px #111",
            backgroundColor: compact ? "#222" : undefined,
            borderRadius: compact ? "0.25rem" : undefined,
            padding: compact ? "0.2rem" : undefined,
            fontSize: valueOf(template, values, "fontSize"),
          }}
        >
          {previewContent}
        </p>
      );
      break;
    case "divider":
      preview = (
        <p className="max-w-full truncate font-mono">
          <span style={{ color: valueOf(template, values, "lineColor") }}>
            {valueOf(template, values, "divider")}
          </span>{" "}
          <span style={{ color: valueOf(template, values, "ornamentColor") }}>
            {valueOf(template, values, "ornament")}
          </span>{" "}
          <span style={{ color: valueOf(template, values, "lineColor") }}>
            {valueOf(template, values, "divider")}
          </span>
        </p>
      );
      break;
  }

  return (
    <div
      className={frameClassName}
      role={compact ? undefined : "img"}
      aria-label={compact ? undefined : `${template.name} 미리보기`}
      aria-hidden={compact ? "true" : undefined}
    >
      {preview}
    </div>
  );
}
