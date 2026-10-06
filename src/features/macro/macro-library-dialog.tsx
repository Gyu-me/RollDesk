"use client";

import {
  Check,
  Clipboard,
  FileCode2,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  macroCategoryLabels,
  macroCategoryOrder,
  macroTemplates,
} from "@/features/macro/macro-templates";
import { MacroTemplatePreview } from "@/features/macro/macro-template-preview";
import {
  getDefaultMacroValues,
  renderMacroCode,
} from "@/features/macro/render-macro-template";
import { useMacroStore } from "@/stores/macro-store";
import type { MacroTemplate, UserMacroInput } from "@/types/macro";

interface MacroLibraryDialogProps {
  initialContent: string;
  onClose: () => void;
}

const firstTemplate = macroTemplates[0];

const emptyDraft: UserMacroInput = {
  name: "",
  memo: "",
  code: "{{content}}",
};

function matchesQuery(values: string[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return true;
  return values.some((value) =>
    value.toLocaleLowerCase().includes(normalizedQuery),
  );
}

export function MacroLibraryDialog({
  initialContent,
  onClose,
}: MacroLibraryDialogProps) {
  const {
    userMacros,
    isLoading,
    error,
    initialize,
    saveUserMacro,
    deleteUserMacro,
  } = useMacroStore();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(firstTemplate?.id ?? "");
  const [content, setContent] = useState(
    initialContent || firstTemplate?.previewText || "",
  );
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    firstTemplate ? getDefaultMacroValues(firstTemplate) : {},
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<UserMacroInput>(emptyDraft);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const selectedTemplate = macroTemplates.find(
    (template) => template.id === selectedId,
  );
  const selectedUserMacro = userMacros.find(
    (userMacro) => userMacro.id === selectedId,
  );
  const selectedCode = selectedTemplate?.code ?? selectedUserMacro?.code ?? "";
  const generatedCode = renderMacroCode(selectedCode, content, fieldValues);

  const filteredTemplates = useMemo(
    () =>
      macroTemplates.filter((template) =>
        matchesQuery(
          [template.name, template.memo, ...template.keywords],
          query,
        ),
      ),
    [query],
  );
  const filteredUserMacros = useMemo(
    () =>
      userMacros.filter((userMacro) =>
        matchesQuery([userMacro.name, userMacro.memo, userMacro.code], query),
      ),
    [query, userMacros],
  );

  const selectTemplate = (template: MacroTemplate) => {
    setSelectedId(template.id);
    setFieldValues(getDefaultMacroValues(template));
    setContent(initialContent || template.previewText);
    setEditingId(null);
    setCopyStatus("idle");
    setIsDeleteConfirming(false);
  };

  const selectUserMacro = (id: string) => {
    setSelectedId(id);
    setFieldValues({});
    setContent(initialContent);
    setEditingId(null);
    setCopyStatus("idle");
    setIsDeleteConfirming(false);
  };

  const startNewUserMacro = () => {
    setEditingId("new");
    setDraft(emptyDraft);
    setIsDeleteConfirming(false);
  };

  const startEditingUserMacro = () => {
    if (!selectedUserMacro) return;
    setEditingId(selectedUserMacro.id);
    setDraft({
      name: selectedUserMacro.name,
      memo: selectedUserMacro.memo,
      code: selectedUserMacro.code,
    });
    setIsDeleteConfirming(false);
  };

  const handleSaveUserMacro = async () => {
    if (!draft.name.trim() || !draft.code.trim()) return;
    const saved = await saveUserMacro(
      draft,
      editingId && editingId !== "new" ? editingId : undefined,
    );
    setSelectedId(saved.id);
    setEditingId(null);
    setFieldValues({});
  };

  const handleDeleteUserMacro = async () => {
    if (!selectedUserMacro) return;
    await deleteUserMacro(selectedUserMacro.id);
    const fallback = firstTemplate;
    setSelectedId(fallback?.id ?? "");
    setFieldValues(fallback ? getDefaultMacroValues(fallback) : {});
    setIsDeleteConfirming(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-[2px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="macro-library-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
        className="border-border bg-surface flex h-[min(800px,calc(100dvh-2rem))] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
      >
        <header className="border-border flex shrink-0 items-center justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 id="macro-library-title" className="font-semibold">
              매크로 템플릿 보관함
            </h2>
            <p className="text-muted-foreground mt-0.5 truncate text-xs">
              기본 템플릿과 직접 저장한 코드를 선택해 Roll20 출력 코드를
              만듭니다.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="매크로 템플릿 보관함 닫기"
            autoFocus
          >
            <X aria-hidden="true" />
          </Button>
        </header>

        <div className="grid min-h-0 flex-1 md:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="border-border flex min-h-0 flex-col border-b p-3 md:border-r md:border-b-0">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="text-muted-foreground pointer-events-none absolute top-2 left-2.5 size-4"
              />
              <label className="sr-only" htmlFor="macro-search">
                매크로 템플릿 검색
              </label>
              <input
                id="macro-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="이름 또는 키워드 검색"
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-8 w-full rounded-lg border pr-3 pl-8 text-sm outline-none focus-visible:ring-2"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startNewUserMacro}
              className="mt-2 w-full"
            >
              <Plus aria-hidden="true" data-icon="inline-start" />
              사용자 템플릿 추가
            </Button>

            <div className="mt-3 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              {macroCategoryOrder.map((categoryId) => {
                const categoryTemplates = filteredTemplates.filter(
                  (template) => template.categoryId === categoryId,
                );
                if (!categoryTemplates.length) return null;

                return (
                  <div key={categoryId}>
                    <p className="text-muted-foreground mb-1 px-2 text-[0.68rem] font-semibold tracking-wider uppercase">
                      {macroCategoryLabels[categoryId]}
                    </p>
                    <ul className="space-y-1">
                      {categoryTemplates.map((template) => (
                        <li key={template.id}>
                          <button
                            type="button"
                            onClick={() => selectTemplate(template)}
                            className={`grid w-full grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2 rounded-xl p-2 text-left transition-colors ${
                              selectedId === template.id && !editingId
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-muted"
                            }`}
                          >
                            <MacroTemplatePreview
                              template={template}
                              content={template.previewText}
                              values={getDefaultMacroValues(template)}
                              compact
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">
                                {template.name}
                              </span>
                              <span className="text-muted-foreground mt-0.5 line-clamp-2 block text-xs leading-4">
                                {template.memo}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              <div>
                <p className="text-muted-foreground mb-1 px-2 text-[0.65rem] font-semibold tracking-wider uppercase">
                  사용자 저장
                </p>
                {isLoading ? (
                  <p className="text-muted-foreground flex items-center gap-2 px-2 py-3 text-xs">
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-3 animate-spin"
                    />
                    불러오는 중
                  </p>
                ) : filteredUserMacros.length ? (
                  <ul className="space-y-1">
                    {filteredUserMacros.map((userMacro) => (
                      <li key={userMacro.id}>
                        <button
                          type="button"
                          onClick={() => selectUserMacro(userMacro.id)}
                          className={`grid w-full grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2 rounded-xl p-2 text-left transition-colors ${
                            selectedId === userMacro.id && !editingId
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className="border-border bg-background flex h-12 w-[4.5rem] items-center justify-center overflow-hidden rounded-lg border px-1.5 text-center font-mono text-[0.5rem] leading-tight"
                          >
                            <span className="line-clamp-3">
                              {renderMacroCode(
                                userMacro.code,
                                initialContent || "내용",
                              )}
                            </span>
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">
                              {userMacro.name}
                            </span>
                            <span className="text-muted-foreground mt-0.5 line-clamp-2 block text-xs leading-4">
                              {userMacro.memo || "설명 없음"}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground px-2 py-3 text-xs">
                    저장한 사용자 템플릿이 없습니다.
                  </p>
                )}
              </div>
            </div>
          </aside>

          <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
            {editingId ? (
              <div className="mx-auto max-w-2xl">
                <div className="flex items-start gap-3">
                  <span className="bg-accent text-accent-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                    <FileCode2 aria-hidden="true" className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold">
                      {editingId === "new"
                        ? "사용자 템플릿 만들기"
                        : "사용자 템플릿 수정"}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                      코드의 {"{{content}}"}는 선택한 ScriptLine 내용으로
                      바뀝니다.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4">
                  <label className="grid gap-1.5 text-sm font-medium">
                    이름
                    <input
                      value={draft.name}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="예: 내가 쓰는 핸드아웃"
                      className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/30 h-9 rounded-lg border px-3 font-normal outline-none focus-visible:ring-2"
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium">
                    설명
                    <input
                      value={draft.memo}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          memo: event.target.value,
                        }))
                      }
                      placeholder="이 템플릿의 용도"
                      className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/30 h-9 rounded-lg border px-3 font-normal outline-none focus-visible:ring-2"
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium">
                    매크로 코드
                    <textarea
                      value={draft.code}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          code: event.target.value,
                        }))
                      }
                      rows={10}
                      placeholder="/desc {{content}}"
                      className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/30 resize-y rounded-lg border p-3 font-mono text-xs leading-5 font-normal outline-none focus-visible:ring-2"
                    />
                  </label>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingId(null)}
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleSaveUserMacro()}
                    disabled={!draft.name.trim() || !draft.code.trim()}
                  >
                    저장
                  </Button>
                </div>
              </div>
            ) : selectedTemplate || selectedUserMacro ? (
              <div className="mx-auto max-w-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {selectedTemplate?.name ?? selectedUserMacro?.name}
                      </h3>
                      <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-[0.65rem]">
                        {selectedTemplate ? "기본 제공" : "사용자 저장"}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {selectedTemplate?.memo ??
                        selectedUserMacro?.memo ??
                        "설명 없음"}
                    </p>
                  </div>
                  {selectedUserMacro ? (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={startEditingUserMacro}
                        aria-label="사용자 템플릿 수정"
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setIsDeleteConfirming(true)}
                        aria-label="사용자 템플릿 삭제"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  ) : null}
                </div>

                {isDeleteConfirming && selectedUserMacro ? (
                  <div className="border-destructive/30 bg-destructive/5 mt-4 flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                    <p className="text-sm">이 사용자 템플릿을 삭제할까요?</p>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDeleteConfirming(false)}
                      >
                        취소
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => void handleDeleteUserMacro()}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-medium sm:col-span-2">
                    ScriptLine 내용
                    <textarea
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      rows={3}
                      placeholder="템플릿에 넣을 내용을 입력하세요"
                      className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/30 resize-y rounded-lg border p-3 font-normal outline-none focus-visible:ring-2"
                    />
                  </label>

                  {selectedTemplate?.fields.map((field) => (
                    <label
                      key={field.key}
                      className="grid gap-1.5 text-sm font-medium"
                    >
                      {field.label}
                      {field.type === "select" ? (
                        <select
                          value={fieldValues[field.key] ?? field.defaultValue}
                          onChange={(event) =>
                            setFieldValues((current) => ({
                              ...current,
                              [field.key]: event.target.value,
                            }))
                          }
                          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/30 h-9 rounded-lg border px-3 font-normal outline-none focus-visible:ring-2"
                        >
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "color" ? (
                        <span className="flex gap-2">
                          <input
                            type="color"
                            value={fieldValues[field.key] ?? field.defaultValue}
                            onChange={(event) =>
                              setFieldValues((current) => ({
                                ...current,
                                [field.key]: event.target.value,
                              }))
                            }
                            className="border-input bg-background h-9 w-12 cursor-pointer rounded-lg border p-1"
                            aria-label={`${field.label} 색상 선택`}
                          />
                          <input
                            value={fieldValues[field.key] ?? field.defaultValue}
                            onChange={(event) =>
                              setFieldValues((current) => ({
                                ...current,
                                [field.key]: event.target.value,
                              }))
                            }
                            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/30 h-9 min-w-0 flex-1 rounded-lg border px-3 font-mono text-xs font-normal outline-none focus-visible:ring-2"
                          />
                        </span>
                      ) : (
                        <input
                          value={fieldValues[field.key] ?? field.defaultValue}
                          onChange={(event) =>
                            setFieldValues((current) => ({
                              ...current,
                              [field.key]: event.target.value,
                            }))
                          }
                          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/30 h-9 rounded-lg border px-3 font-normal outline-none focus-visible:ring-2"
                        />
                      )}
                    </label>
                  ))}
                </div>

                {selectedTemplate ? (
                  <div className="mt-5">
                    <div className="mb-1.5 flex items-end justify-between gap-3">
                      <h4 className="text-sm font-medium">
                        적용 결과 미리보기
                      </h4>
                      <p className="text-muted-foreground text-[0.68rem]">
                        실제 Roll20 출력과 일부 차이가 있을 수 있습니다.
                      </p>
                    </div>
                    <MacroTemplatePreview
                      template={selectedTemplate}
                      content={content}
                      values={fieldValues}
                    />
                  </div>
                ) : null}

                <div className="mt-5">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label
                      htmlFor="generated-macro-code"
                      className="text-sm font-medium"
                    >
                      생성된 코드
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void handleCopy()}
                      disabled={!generatedCode}
                    >
                      {copyStatus === "copied" ? (
                        <Check aria-hidden="true" data-icon="inline-start" />
                      ) : (
                        <Clipboard
                          aria-hidden="true"
                          data-icon="inline-start"
                        />
                      )}
                      {copyStatus === "copied" ? "복사됨" : "코드 복사"}
                    </Button>
                  </div>
                  <textarea
                    id="generated-macro-code"
                    value={generatedCode}
                    readOnly
                    rows={8}
                    className="border-input bg-surface-muted w-full resize-y rounded-lg border p-3 font-mono text-xs leading-5 outline-none"
                  />
                  {copyStatus === "error" ? (
                    <p className="text-destructive mt-1 text-xs">
                      자동 복사에 실패했습니다. 코드를 직접 선택해 복사해
                      주세요.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                템플릿을 선택해 주세요.
              </div>
            )}

            {error ? (
              <p className="text-destructive mt-3 text-xs">{error}</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
