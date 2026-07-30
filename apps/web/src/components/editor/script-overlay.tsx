"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  buildStoryboardPrompt,
  countWords,
  estimateSeconds,
  formatDuration,
} from "@foundry/shared-types";
import { SPRING } from "@/components/ui/primitives";
import { copyToClipboard } from "@/lib/clipboard";
import { useSaveScript, useScript } from "@/lib/queries/script";

interface ScriptOverlayProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

const AUTOSAVE_MS = 1200;
const COPIED_MS = 2000;

export function ScriptOverlay({ projectId, open, onClose }: ScriptOverlayProps) {
  const { data: script } = useScript(projectId);
  const saveScript = useSaveScript(projectId);

  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const loadedFor = useRef<string | null>(null);

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

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const words = countWords(content);
  const seconds = estimateSeconds(words);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-primary/10"
          />
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={SPRING}
            className="absolute right-0 top-0 z-40 flex h-full w-[min(560px,80%)] flex-col
                       border-l border-border bg-surface"
            aria-label="Script editor"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
              <h2 className="font-display text-base tracking-tight">Script</h2>
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
              className="min-h-0 flex-1 resize-none bg-transparent px-5 py-4
                         font-display text-base leading-relaxed tracking-tight outline-none
                         placeholder:text-secondary/55"
            />

            {content.trim() && (
              <div className="flex shrink-0 items-center gap-3 border-t border-border px-5 py-3">
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
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
