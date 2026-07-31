"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildStoryboardPrompt,
  countWords,
  estimateSeconds,
  formatDuration,
} from "@foundry/shared-types";
import { copyToClipboard } from "@/lib/clipboard";
import { useSaveScript, useScript } from "@/lib/queries/script";

interface ScriptViewProps {
  projectId: string;
}

const AUTOSAVE_MS = 1200;
const COPIED_MS = 2000;

/**
 * Полноэкранный вид этапа Script. Не оверлей: пока он смонтирован,
 * Storyboard не рендерится вовсе — иначе сквозь текст просвечивал канвас.
 * Текст живёт в кеше React Query (useScript), поэтому переключение вида
 * туда-обратно ничего не теряет.
 */
export function ScriptView({ projectId }: ScriptViewProps) {
  const { data: script } = useScript(projectId);
  const saveScript = useSaveScript(projectId);

  const [content, setContent] = useState(script?.content ?? "");
  const [dirty, setDirty] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const loadedFor = useRef<string | null>(script ? projectId : null);

  useEffect(() => {
    if (script && loadedFor.current !== projectId) {
      setContent(script.content);
      loadedFor.current = projectId;
    }
  }, [script, projectId]);

  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      saveScript.mutate({ content });
      setDirty(false);
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [content, dirty, saveScript]);

  // Несохранённый текст не должен уехать вместе с размонтированием вида:
  // при уходе со степа дописываем последнюю правку сразу.
  const pending = useRef({ content, dirty });
  pending.current = { content, dirty };
  useEffect(() => {
    const save = saveScript.mutate;
    return () => {
      if (pending.current.dirty) save({ content: pending.current.content });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const words = countWords(content);
  const seconds = estimateSeconds(words);

  return (
    <section
      className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-bg"
      aria-label="Script editor"
    >
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-8 py-10">
        <div className="mb-6 flex shrink-0 items-baseline justify-between">
          <h1 className="font-display text-2xl tracking-tight">Script</h1>
          <div className="flex items-center gap-4 text-xs tabular-nums text-secondary">
            <span>{words.toLocaleString()} words</span>
            <span>{formatDuration(seconds)}</span>
            <span>{dirty || saveScript.isPending ? "Saving…" : "Saved"}</span>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setDirty(true);
          }}
          placeholder="Start writing the narration. Leave a blank line between beats — each block becomes a scene."
          spellCheck={false}
          autoFocus
          className="min-h-[50vh] w-full flex-1 resize-none bg-transparent
                     font-display text-lg leading-relaxed tracking-tight outline-none
                     placeholder:text-secondary/55"
        />

        {content.trim() && (
          <div className="mt-6 flex shrink-0 items-center gap-3">
            <button
              onClick={async () => {
                const prompt = buildStoryboardPrompt(content);
                const ok = await copyToClipboard(prompt);
                if (ok) setCopied(true);
                else setCopyError(true);
              }}
              className="text-xs text-secondary transition-colors hover:text-primary"
            >
              {copied ? "Copied!" : "Copy storyboard prompt"}
            </button>
            {copyError && (
              <span className="text-xs text-accent">
                Could not copy — select and copy manually.
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
