"use client";

import { useEffect, useState } from "react";
import { buildStoryboardPrompt } from "@foundry/shared-types";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { copyToClipboard } from "@/lib/clipboard";
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
  const importStoryboard = useImportStoryboard(projectId);

  const [raw, setRaw] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const scriptContent = script?.content ?? "";
  const hasScript = scriptContent.trim().length > 0;

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
    if (!hasScript) return;
    const prompt = buildStoryboardPrompt(scriptContent);
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

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={copyPrompt}
            disabled={!hasScript}
          >
            {copied ? "Copied!" : "Copy prompt"}
          </Button>
          {!hasScript && (
            <span className="text-xs text-secondary">
              Write the script first — the prompt is built from it.
            </span>
          )}
          {copyError && (
            <span className="text-xs text-accent">
              Could not copy — select and copy the prompt manually.
            </span>
          )}
        </div>

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
