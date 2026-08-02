"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_SCRIPT_LENGTH,
  SCRIPT_LANGUAGES,
  SCRIPT_LENGTH_PRESETS,
  buildScriptFromTopicPrompt,
  buildStoryboardPrompt,
  detectScriptLanguage,
  effectiveVisualStyle,
  hasDefaultTitle,
  storyboardPromptMode,
  type ScriptLanguageKey,
  type ScriptLengthKey,
  type VisualStyleKey,
} from "@foundry/shared-types";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { VisualStyleField } from "@/components/scenes/visual-style-field";
import { copyToClipboard } from "@/lib/clipboard";
import { useProject, useUpdateProject } from "@/lib/queries/projects";
import { useSettings } from "@/lib/queries/settings";
import { useImportStoryboard } from "@/lib/queries/scenes";
import { useScript } from "@/lib/queries/script";

interface ImportStoryboardDialogProps {
  projectId: string;
  sceneCount: number;
  open: boolean;
  onClose: () => void;
}

const COPIED_MS = 2000;

/**
 * Раскадровка приходит извне: промпт уходит в любой чат, ответ возвращается
 * сюда как JSON. Разбор — на бэкенде, здесь только буфер обмена и textarea.
 */
export function ImportStoryboardDialog({
  projectId,
  sceneCount,
  open,
  onClose,
}: ImportStoryboardDialogProps) {
  const { data: script } = useScript(projectId);
  const { data: project } = useProject(projectId);
  const { data: settings } = useSettings();
  const updateProject = useUpdateProject(projectId);
  const importStoryboard = useImportStoryboard(projectId);

  const [raw, setRaw] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [briefDraft, setBriefDraft] = useState<string | null>(null);
  const [styleCustomDraft, setStyleCustomDraft] = useState<string | null>(null);
  const [length, setLength] = useState<ScriptLengthKey>(DEFAULT_SCRIPT_LENGTH);
  const [languageChoice, setLanguageChoice] = useState<ScriptLanguageKey | null>(
    null,
  );

  const scriptContent = script?.content ?? "";
  // Режим — не выбор пользователя, а состояние проекта: как только в Script
  // появился текст, разбивать надо именно его, а не сочинять новый.
  const mode = storyboardPromptMode(scriptContent);

  const topic = project?.title ?? "";
  const brief = briefDraft ?? project?.brief ?? "";
  const thinTopic = !topic.trim() || hasDefaultTitle(topic);

  // По умолчанию — язык того, что уже написано; ручной выбор его перебивает.
  const sourceLanguage = detectScriptLanguage(scriptContent || brief);
  const language = languageChoice ?? sourceLanguage;

  // Пока на проекте стиль не выбран, показываем дефолт пользователя — тот же,
  // с которым уйдёт промпт, если ничего не трогать.
  const style = effectiveVisualStyle(
    project?.visualStyle ? { key: project.visualStyle } : null,
    settings ? { key: settings.defaultVisualStyle } : null,
  );
  const styleCustom =
    styleCustomDraft ??
    (project?.visualStyle
      ? (project.visualStyleCustom ?? "")
      : (settings?.defaultVisualStyleCustom ?? ""));

  function setStyleKey(key: VisualStyleKey) {
    setStyleCustomDraft(null);
    updateProject.mutate({
      visualStyle: key,
      // Пресет не носит с собой чужой текст: он осмыслен только для custom.
      visualStyleCustom: key === "custom" ? styleCustom.trim() || null : null,
    });
  }

  function saveStyleCustom() {
    if (styleCustomDraft === null) return;
    const trimmed = styleCustomDraft.trim();
    setStyleCustomDraft(null);
    if (trimmed !== (project?.visualStyleCustom ?? "").trim()) {
      updateProject.mutate({
        visualStyle: "custom",
        visualStyleCustom: trimmed || null,
      });
    }
  }

  function saveBrief() {
    if (briefDraft === null) return;
    const trimmed = briefDraft.trim();
    setBriefDraft(null);
    if (trimmed !== (project?.brief ?? "").trim()) {
      updateProject.mutate({ brief: trimmed || null });
    }
  }

  // Подпись «Copied» живёт 2 секунды — таймер гасим, чтобы не писать в размонтированный стейт.
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (!copyError) return;
    const timer = setTimeout(() => setCopyError(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copyError]);

  async function copyPrompt() {
    // Бриф и стиль могли остаться неотправленными черновиками — в промпт они
    // нужны сразу, поэтому дописываются перед сборкой.
    saveBrief();
    saveStyleCustom();

    const styleForPrompt = { key: style.key, custom: styleCustom };
    const prompt =
      mode === "from-script"
        ? buildStoryboardPrompt(scriptContent, language, styleForPrompt)
        : buildScriptFromTopicPrompt(
            topic,
            brief,
            length,
            language,
            styleForPrompt,
          );

    const ok = await copyToClipboard(prompt);
    if (ok) setCopied(true);
    else setCopyError(true);
  }

  function submit() {
    importStoryboard.mutate(raw, {
      onSuccess: () => {
        setRaw("");
        onClose();
      },
    });
  }

  const error =
    importStoryboard.error instanceof ApiError
      ? importStoryboard.error.message
      : null;

  return (
    <Dialog
      id="import-storyboard"
      open={open}
      onClose={onClose}
      ariaLabel="Import storyboard"
      className="w-[560px]"
      header={
        <h2 className="font-display text-lg tracking-tight">
          Import storyboard
        </h2>
      }
    >
      <div className="space-y-4 px-5 py-4">
        <p className="text-xs text-secondary">
          Copy the prompt, run it in any chat model, then paste the JSON answer
          back here.
        </p>

        {/* Тема нужна только когда сценарий пишется с нуля: при заполненном
            Script модель обязана разбирать его, а не сочинять по брифу. */}
        {mode === "from-topic" && (
          <div className="space-y-2 rounded-md border border-border px-3 py-2.5">
            <div className="flex items-baseline gap-2">
              <p className="text-xs uppercase tracking-tight text-secondary">
                Topic
              </p>
              <span className="min-w-0 flex-1 truncate text-xs text-primary">
                {topic || "Untitled project"}
              </span>
            </div>
            <textarea
              value={brief}
              onChange={(e) => setBriefDraft(e.target.value)}
              onBlur={saveBrief}
              rows={2}
              maxLength={600}
              placeholder="What the video is about, who it is for, the tone you want."
              className="w-full resize-none rounded-sm border border-border bg-bg px-2.5 py-2
                         text-xs leading-relaxed outline-none transition-colors
                         focus:border-secondary/40 placeholder:text-secondary/60"
            />
            {thinTopic && !brief.trim() && (
              <p className="text-xs text-secondary">
                Name the project or add a couple of lines here — the model has
                nothing else to build the script on.
              </p>
            )}

            {/* Без явного таргета модель почти всегда пишет пересказ вместо
                сценария, поэтому длину выбираем до копирования промпта. */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-xs text-secondary">Length</span>
              <div className="flex items-center gap-0.5 rounded-sm border border-border p-0.5">
                {SCRIPT_LENGTH_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => setLength(preset.key)}
                    aria-pressed={length === preset.key}
                    title={preset.hint}
                    className={cn(
                      "rounded-sm px-2 py-0.5 text-xs transition-colors",
                      length === preset.key
                        ? "bg-accent-soft text-accent"
                        : "text-secondary hover:text-primary",
                    )}
                  >
                    {preset.label}
                    <span className="ml-1.5 tabular-nums opacity-70">
                      {preset.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Стиль виден в обоих режимах: и разбивка, и bootstrap пишут промпты
            картинок, а ролик должен быть выдержан в одном визуальном языке. */}
        <VisualStyleField
          value={style.key}
          custom={styleCustom}
          onChange={setStyleKey}
          onCustomChange={setStyleCustomDraft}
          onCustomCommit={saveStyleCustom}
        />

        {/* Язык виден в обоих режимах: инструкции промпта остаются
            английскими, меняется только язык самого текста ролика. */}
        <div className="flex items-center gap-3">
          <Button size="sm" variant="secondary" onClick={copyPrompt}>
            {copied ? "Copied!" : "Copy prompt"}
          </Button>

          <label className="flex shrink-0 items-center gap-1.5 text-xs text-secondary">
            Language
            <select
              value={language}
              onChange={(e) =>
                setLanguageChoice(e.target.value as ScriptLanguageKey)
              }
              className="rounded-sm border border-border bg-bg px-1.5 py-1 text-xs
                         text-primary outline-none transition-colors
                         focus:border-secondary/40"
            >
              {SCRIPT_LANGUAGES.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <span className="min-w-0 flex-1 text-xs text-secondary">
            {mode === "from-script"
              ? "Splits the script you wrote — the model won't rewrite it."
              : "Writes the script from the topic, then splits it into scenes."}
          </span>
          {copyError && (
            <span className="shrink-0 text-xs text-accent">
              Could not copy — select and copy the prompt manually.
            </span>
          )}
        </div>

        {/* Разбивка копирует voiceText дословно, поэтому сменить его язык
            здесь нельзя — это был бы перевод, а не раскадровка. */}
        {mode === "from-script" && language !== sourceLanguage && (
          <p className="text-xs text-accent">
            Scene narration stays in the language you wrote it in — only scene
            titles switch. Translating a script isn&apos;t supported yet.
          </p>
        )}

        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="Paste the model's JSON answer here."
          spellCheck={false}
          className="min-h-[220px] w-full resize-none rounded-md border border-border
                           bg-bg px-3 py-2.5 font-mono text-xs leading-relaxed outline-none
                           transition-colors focus:border-secondary/40
                           placeholder:text-secondary/45"
        />

        {sceneCount > 0 && (
          <p className="text-xs text-accent">
            Importing replaces {sceneCount} existing scene
            {sceneCount === 1 ? "" : "s"} and their assets.
          </p>
        )}

        {error && <p className="text-xs text-accent">{error}</p>}

        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={submit}
            disabled={!raw.trim() || importStoryboard.isPending}
          >
            {importStoryboard.isPending ? "Importing…" : "Import scenes"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
