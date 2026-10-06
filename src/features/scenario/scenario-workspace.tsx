"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  FilePlus2,
  FileText,
  Italic,
  LoaderCircle,
  Palette,
  PanelLeft,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { resolveScriptLineStyle } from "@/features/scenario/script-line-style";
import { scriptLineTags } from "@/features/scenario/script-line-tags";
import { SortableScriptLineCard } from "@/features/scenario/sortable-script-line-card";
import { useScenarioStore } from "@/stores/scenario-store";
import { useSettingsStore } from "@/stores/settings-store";
import type { ScriptLineStyle } from "@/types/scenario";

const saveStatusText = {
  idle: "준비 중",
  dirty: "저장 대기 중",
  saving: "저장 중",
  saved: "저장됨",
  error: "저장 실패",
} as const;

export function ScenarioWorkspace() {
  const [isTagColorDialogOpen, setIsTagColorDialogOpen] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [pendingDeleteLine, setPendingDeleteLine] = useState<{
    id: string;
    order: number;
    text: string;
  } | null>(null);
  const { tagColors, hydrateSettings, setTagColor, resetTagColors } =
    useSettingsStore();
  const {
    scenarios,
    activeScenario,
    isLoading,
    saveStatus,
    initialize,
    createNewScenario,
    selectScenario,
    updateTitle,
    updateSourceText,
    structureSource,
    updateScriptLine,
    updateScriptLineTag,
    updateScriptLineStyle,
    splitScriptLine,
    insertScriptLineAfter,
    deleteScriptLine,
    reorderScriptLines,
    saveActiveScenario,
  } = useScenarioStore();
  const selectedScriptLine = activeScenario?.scriptLines.find(
    (line) => line.id === selectedLineId,
  );
  const selectedLineStyle = resolveScriptLineStyle(selectedScriptLine?.style);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const focusScriptLine = (id: string) => {
    window.requestAnimationFrame(() => {
      const element = document.getElementById(
        `script-line-${id}`,
      ) as HTMLTextAreaElement | null;
      element?.focus();
      element?.setSelectionRange(0, 0);
    });
  };

  const handleSplitScriptLine = (id: string, offset: number) => {
    const newLineId = splitScriptLine(id, offset);
    if (newLineId) focusScriptLine(newLineId);
  };

  const handleInsertLine = (id: string) => {
    const newLineId = insertScriptLineAfter(id);
    if (newLineId) focusScriptLine(newLineId);
  };

  const handleAppendLine = () => {
    const lines = activeScenario?.scriptLines;
    const lastLine = lines?.[lines.length - 1];
    if (lastLine) handleInsertLine(lastLine.id);
  };

  const handleDeleteLine = (id: string, order: number, text: string) => {
    setPendingDeleteLine({ id, order, text });
  };

  const handleStyleChange = (changes: Partial<ScriptLineStyle>) => {
    if (selectedLineId) updateScriptLineStyle(selectedLineId, changes);
  };

  const confirmDeleteLine = () => {
    if (!pendingDeleteLine) return;
    deleteScriptLine(pendingDeleteLine.id);
    setPendingDeleteLine(null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    reorderScriptLines(String(active.id), String(over.id));
  };

  useEffect(() => {
    void initialize();
    hydrateSettings();
  }, [hydrateSettings, initialize]);

  useEffect(() => {
    if (saveStatus !== "dirty") return;

    const timeoutId = window.setTimeout(() => {
      void saveActiveScenario();
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [activeScenario?.updatedAt, saveActiveScenario, saveStatus]);

  return (
    <main className="bg-background h-dvh overflow-hidden p-3 sm:p-5">
      <div className="border-border bg-surface mx-auto flex h-full min-h-0 max-w-[1800px] flex-col overflow-hidden rounded-2xl border shadow-sm">
        <header className="border-border flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl">
              <PanelLeft aria-hidden="true" className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">RollDesk</p>
              <p className="text-muted-foreground text-xs">
                TRPG Scenario Workspace
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-muted-foreground hidden items-center gap-1.5 text-xs sm:flex"
              role="status"
            >
              {saveStatus === "saving" ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-3.5 animate-spin"
                />
              ) : (
                <Save aria-hidden="true" className="size-3.5" />
              )}
              {saveStatusText[saveStatus]}
            </span>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)] overflow-hidden lg:grid-cols-[210px_minmax(300px,0.8fr)_minmax(380px,1.2fr)] lg:grid-rows-1">
          <aside className="border-border bg-surface-muted/50 max-h-40 [scrollbar-gutter:stable] overflow-y-auto border-b p-4 lg:max-h-none lg:min-h-0 lg:border-r lg:border-b-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">시나리오</h2>
                <p className="text-muted-foreground text-xs">
                  {scenarios.length}개 저장됨
                </p>
              </div>
              <Button
                type="button"
                size="icon-sm"
                onClick={() => void createNewScenario()}
                aria-label="새 시나리오 만들기"
              >
                <FilePlus2 aria-hidden="true" />
              </Button>
            </div>

            <nav aria-label="시나리오 목록">
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {scenarios.map((scenario) => {
                  const isActive = scenario.id === activeScenario?.id;
                  return (
                    <li key={scenario.id}>
                      <button
                        type="button"
                        onClick={() => void selectScenario(scenario.id)}
                        className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                          isActive
                            ? "border-primary/25 bg-background text-foreground"
                            : "text-muted-foreground hover:border-border hover:bg-background/70 hover:text-foreground border-transparent"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span className="flex items-start gap-2.5">
                          <FileText
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0"
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">
                              {scenario.title || "제목 없는 시나리오"}
                            </span>
                            <span className="mt-1 block text-xs opacity-70">
                              {new Intl.DateTimeFormat("ko-KR", {
                                month: "short",
                                day: "numeric",
                              }).format(new Date(scenario.updatedAt))}
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <section className="border-border flex min-h-0 flex-col overflow-hidden border-b p-4 sm:p-6 lg:border-r lg:border-b-0">
            {isLoading || !activeScenario ? (
              <div className="text-muted-foreground flex flex-1 items-center justify-center gap-2 text-sm">
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
                시나리오 불러오는 중
              </div>
            ) : (
              <>
                <label className="sr-only" htmlFor="scenario-title">
                  시나리오 제목
                </label>
                <input
                  id="scenario-title"
                  value={activeScenario.title}
                  onChange={(event) => updateTitle(event.target.value)}
                  className="placeholder:text-muted-foreground focus-visible:ring-ring mb-5 w-full rounded-lg bg-transparent px-1 py-2 text-2xl font-semibold tracking-tight outline-none focus-visible:ring-2"
                  placeholder="시나리오 제목"
                />

                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h1 className="text-sm font-semibold">시나리오 원문</h1>
                    <p className="text-muted-foreground text-xs">
                      줄바꿈과 마침표를 기준으로 ScriptLine을 만듭니다.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={structureSource}
                    disabled={!activeScenario.sourceText.trim()}
                  >
                    <Sparkles aria-hidden="true" data-icon="inline-start" />
                    구조화
                  </Button>
                </div>

                <label className="sr-only" htmlFor="scenario-source">
                  시나리오 원문
                </label>
                <textarea
                  id="scenario-source"
                  value={activeScenario.sourceText}
                  onChange={(event) => updateSourceText(event.target.value)}
                  placeholder={
                    "낡은 문이 천천히 열린다.\n\n조사자: 안에 누가 있습니까?\n\n어둠 속에서 인기척이 들린다."
                  }
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 min-h-0 flex-1 resize-none rounded-xl border p-4 font-mono text-sm leading-7 outline-none focus-visible:ring-3"
                />
              </>
            )}
          </section>

          <section className="bg-surface-muted/30 flex min-h-0 flex-col overflow-hidden p-4 sm:p-6">
            <div className="mb-2 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">구조화 결과</h2>
                <p className="text-muted-foreground text-xs">
                  직접 수정하거나 Enter로 나누고, 손잡이로 순서를 바꿀 수
                  있습니다.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  {activeScenario?.scriptLines.length ?? 0} lines
                </span>
                {activeScenario?.scriptLines.length ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAppendLine}
                    aria-label="새 ScriptLine 추가"
                  >
                    <Plus aria-hidden="true" data-icon="inline-start" />새 줄
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setIsTagColorDialogOpen(true)}
                  aria-label="태그 색상 설정"
                >
                  <Palette aria-hidden="true" />
                </Button>
              </div>
            </div>

            {activeScenario?.scriptLines.length ? (
              <div className="border-border bg-background mb-3 flex min-h-8 items-center justify-between gap-3 rounded-lg border px-2 py-1">
                <span className="text-muted-foreground min-w-0 truncate text-xs">
                  {selectedScriptLine
                    ? `${selectedScriptLine.order + 1}번 줄 꾸미기`
                    : "꾸밀 ScriptLine을 선택하세요"}
                </span>
                <div
                  className="flex shrink-0 items-center gap-0.5"
                  role="toolbar"
                  aria-label="선택한 ScriptLine 꾸미기"
                >
                  <Button
                    type="button"
                    variant={selectedLineStyle.bold ? "secondary" : "ghost"}
                    size="icon-xs"
                    disabled={!selectedScriptLine}
                    aria-label="굵게"
                    aria-pressed={selectedLineStyle.bold}
                    onClick={() =>
                      handleStyleChange({ bold: !selectedLineStyle.bold })
                    }
                  >
                    <Bold aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant={selectedLineStyle.italic ? "secondary" : "ghost"}
                    size="icon-xs"
                    disabled={!selectedScriptLine}
                    aria-label="기울임"
                    aria-pressed={selectedLineStyle.italic}
                    onClick={() =>
                      handleStyleChange({ italic: !selectedLineStyle.italic })
                    }
                  >
                    <Italic aria-hidden="true" />
                  </Button>
                  <span
                    aria-hidden="true"
                    className="bg-border mx-1 h-4 w-px"
                  />
                  {(
                    [
                      ["left", "왼쪽 정렬", AlignLeft],
                      ["center", "가운데 정렬", AlignCenter],
                      ["right", "오른쪽 정렬", AlignRight],
                    ] as const
                  ).map(([textAlign, label, Icon]) => (
                    <Button
                      key={textAlign}
                      type="button"
                      variant={
                        selectedLineStyle.textAlign === textAlign
                          ? "secondary"
                          : "ghost"
                      }
                      size="icon-xs"
                      disabled={!selectedScriptLine}
                      aria-label={label}
                      aria-pressed={selectedLineStyle.textAlign === textAlign}
                      onClick={() => handleStyleChange({ textAlign })}
                    >
                      <Icon aria-hidden="true" />
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            {activeScenario?.scriptLines.length ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={activeScenario.scriptLines.map((line) => line.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ol
                    className="min-h-0 flex-1 [scrollbar-gutter:stable] space-y-2 overflow-y-auto pr-1"
                    aria-label="구조화된 ScriptLine 목록"
                  >
                    {activeScenario.scriptLines.map((line) => (
                      <SortableScriptLineCard
                        key={line.id}
                        line={line}
                        tagColor={tagColors[line.tag]}
                        isSelected={line.id === selectedLineId}
                        onSelect={setSelectedLineId}
                        onUpdateText={updateScriptLine}
                        onUpdateTag={updateScriptLineTag}
                        onSplit={handleSplitScriptLine}
                        onRequestDelete={handleDeleteLine}
                      />
                    ))}
                  </ol>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="border-border text-muted-foreground flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                <Sparkles aria-hidden="true" className="mb-3 size-6" />
                <p className="text-sm font-medium">
                  아직 구조화된 줄이 없습니다.
                </p>
                <p className="mt-1 max-w-xs text-xs leading-5">
                  원문을 입력하고 구조화 버튼을 누르면 결과가 여기에 표시됩니다.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {pendingDeleteLine ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPendingDeleteLine(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
            onKeyDown={(event) => {
              if (event.key === "Escape") setPendingDeleteLine(null);
            }}
            className="border-border bg-surface w-full max-w-md rounded-2xl border p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <span className="bg-destructive/10 text-destructive flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Trash2 aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0">
                <h2 id="delete-dialog-title" className="text-lg font-semibold">
                  ScriptLine 삭제
                </h2>
                <p
                  id="delete-dialog-description"
                  className="text-muted-foreground mt-2 text-sm leading-6"
                >
                  {pendingDeleteLine.order + 1}번 ScriptLine을 삭제할까요? 삭제
                  결과는 자동으로 저장됩니다.
                </p>
              </div>
            </div>

            <blockquote className="border-border bg-surface-muted text-muted-foreground mt-5 line-clamp-3 rounded-xl border p-3 text-sm leading-6">
              {pendingDeleteLine.text || "내용이 없는 ScriptLine"}
            </blockquote>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingDeleteLine(null)}
                autoFocus
              >
                취소
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDeleteLine}
              >
                삭제
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      {isTagColorDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsTagColorDialogOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="tag-color-dialog-title"
            aria-describedby="tag-color-dialog-description"
            onKeyDown={(event) => {
              if (event.key === "Escape") setIsTagColorDialogOpen(false);
            }}
            className="border-border bg-surface w-full max-w-lg rounded-2xl border p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <span className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Palette aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2
                  id="tag-color-dialog-title"
                  className="text-lg font-semibold"
                >
                  태그 색상 설정
                </h2>
                <p
                  id="tag-color-dialog-description"
                  className="text-muted-foreground mt-1 text-sm leading-6"
                >
                  색상은 이 브라우저에 저장되며 모든 시나리오에 적용됩니다.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {scriptLineTags.map((tag) => (
                <label
                  key={tag.value}
                  className="border-border bg-background flex items-center justify-between gap-4 rounded-xl border px-4 py-3"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: tagColors[tag.value] }}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {tag.label}
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {tag.description}
                      </span>
                    </span>
                  </span>
                  <input
                    type="color"
                    value={tagColors[tag.value]}
                    onChange={(event) =>
                      setTagColor(tag.value, event.target.value)
                    }
                    aria-label={`${tag.label} 태그 색상`}
                    className="border-border bg-surface-muted h-9 w-12 cursor-pointer rounded-lg border p-1"
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button type="button" variant="ghost" onClick={resetTagColors}>
                <RotateCcw aria-hidden="true" data-icon="inline-start" />
                기본값 복원
              </Button>
              <Button
                type="button"
                onClick={() => setIsTagColorDialogOpen(false)}
                autoFocus
              >
                완료
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
