"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

import { Button } from "@/components/ui/button";
import {
  getScriptLineTagDefinition,
  scriptLineTags,
} from "@/features/scenario/script-line-tags";
import { resolveScriptLineStyle } from "@/features/scenario/script-line-style";
import type { ScriptLine, ScriptLineTag } from "@/types/scenario";

interface SortableScriptLineCardProps {
  line: ScriptLine;
  tagColor: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onUpdateTag: (id: string, tag: ScriptLineTag) => void;
  onSplit: (id: string, offset: number) => void;
  onRequestDelete: (id: string, order: number, text: string) => void;
}

export function SortableScriptLineCard({
  line,
  tagColor,
  isSelected,
  onSelect,
  onUpdateText,
  onUpdateTag,
  onSplit,
  onRequestDelete,
}: SortableScriptLineCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineStyle = resolveScriptLineStyle(line.style);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: line.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    "--script-line-tag-color": tagColor,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.75 : 1,
  } as CSSProperties;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    onSplit(line.id, event.currentTarget.selectionStart);
  };

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.max(textarea.scrollHeight, 32)}px`;
  }, [line.text]);

  return (
    <li
      ref={setNodeRef}
      style={style}
      onFocusCapture={() => onSelect(line.id)}
      onPointerDownCapture={() => onSelect(line.id)}
    >
      <div
        className={`script-line-card border-border group grid grid-cols-[1.5rem_2rem_6.25rem_minmax(0,1fr)_2rem] items-start gap-2 rounded-xl border border-l-4 px-2 py-1.5 transition-shadow ${
          isSelected ? "ring-ring/40 ring-2" : ""
        }`}
      >
        <span className="text-muted-foreground flex h-8 items-center justify-center font-mono text-xs tabular-nums">
          {line.order + 1}
        </span>
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-8 cursor-grab touch-none items-center justify-center rounded-lg outline-none focus-visible:ring-2 active:cursor-grabbing"
          aria-label={`${line.order + 1}번 ScriptLine 순서 이동`}
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" className="size-4" />
        </button>
        <div className="relative flex h-8 items-center">
          <label className="sr-only" htmlFor={`script-line-tag-${line.id}`}>
            {line.order + 1}번 ScriptLine 태그
          </label>
          <select
            id={`script-line-tag-${line.id}`}
            value={line.tag}
            onChange={(event) =>
              onUpdateTag(line.id, event.target.value as ScriptLineTag)
            }
            title={getScriptLineTagDefinition(line.tag).description}
            className="script-line-tag-select focus-visible:border-ring focus-visible:ring-ring/30 h-7 w-full rounded-lg border py-1 pr-6 pl-2.5 text-xs font-medium outline-none focus-visible:ring-2"
          >
            {scriptLineTags.map((tag) => (
              <option key={tag.value} value={tag.value}>
                {tag.label}
              </option>
            ))}
          </select>
        </div>
        <label className="sr-only" htmlFor={`script-line-${line.id}`}>
          {line.order + 1}번 ScriptLine
        </label>
        <textarea
          ref={textareaRef}
          id={`script-line-${line.id}`}
          value={line.text}
          rows={1}
          onChange={(event) => onUpdateText(line.id, event.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            fontWeight: lineStyle.bold ? 700 : 400,
            fontStyle: lineStyle.italic ? "italic" : "normal",
            textAlign: lineStyle.textAlign,
          }}
          className="placeholder:text-muted-foreground focus-visible:ring-ring min-h-8 w-full resize-none overflow-hidden rounded-md bg-transparent px-2 py-1.5 text-sm leading-5 outline-none focus-visible:ring-2"
          placeholder="ScriptLine 내용을 입력하세요"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onRequestDelete(line.id, line.order, line.text)}
          aria-label={`${line.order + 1}번 ScriptLine 삭제`}
          className="text-muted-foreground hover:text-destructive"
        >
          <X aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}
