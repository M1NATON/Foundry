"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText } from "lucide-react";
import type { Scene, Script } from "@foundry/shared-types";
import {
  activeAssetOf,
  countWords,
  estimateSeconds,
  formatDuration,
} from "@foundry/shared-types";
import { SPRING } from "@/components/ui/primitives";
import { useSceneField } from "@/lib/use-scene-field";

interface StageProps {
  projectId: string;
  scene: Scene | null;
  script: Script | null;
  onOpenScript: () => void;
}

/**
 * Холст: показывает key-art активной сцены — явно выбранный кадр/клип
 * (scene.activeFrameId / activeVideoId), а не «последний сгенерированный».
 * Voiceover слева редактируется прямо на холсте — тот же источник данных,
 * что и поле в инспекторе (общий React Query кеш, debounce).
 */
export function Stage({
  projectId,
  scene,
  script,
  onOpenScript,
}: StageProps) {
  const voice = useSceneField(projectId, scene, "voiceText");
  const activeVideo = scene && activeAssetOf(scene, "VIDEO");
  const activeFrame = scene && activeAssetOf(scene, "IMAGE");
  const keyArt =
    (activeVideo?.status === "READY" && activeVideo.url ? activeVideo : null) ??
    (activeFrame?.status === "READY" && activeFrame.url ? activeFrame : null);

  const voiceRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea по контенту — без фиксированных rows.
  useEffect(() => {
    const el = voiceRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [scene?.id, scene?.voiceText]);

  const scriptSeconds = script ? estimateSeconds(script.wordCount) : 0;

  return (
    <section className="relative flex min-h-0 flex-1 overflow-hidden bg-bg">
      <AnimatePresence mode="wait">
        {scene ? (
          <motion.div
            key={scene.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex h-full w-full"
          >
            <div className="w-1/3 shrink-0 overflow-y-auto border-r border-border p-6">
              <p className="mb-2 text-xs uppercase tracking-wide text-secondary">
                Voiceover
              </p>
              <textarea
                ref={voiceRef}
                {...voice.fieldProps}
                placeholder="Write the voiceover for this scene…"
                spellCheck={false}
                className="w-full resize-none overflow-hidden bg-transparent
                           font-display text-lg leading-relaxed tracking-tight
                           outline-none placeholder:text-secondary/70"
              />
            </div>

            <div className="relative flex flex-1 items-center justify-center bg-bg">
              {keyArt?.url ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={keyArt.url}
                    alt={scene.title}
                    className="max-h-full w-full object-contain"
                  />
                  <figcaption className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-md bg-surface/90 px-3 py-1.5 text-xs text-secondary shadow-subtle backdrop-blur">
                    {scene.title}
                    {scene.durationSec != null && (
                      <span className="ml-2 tabular-nums">
                        {formatDuration(scene.durationSec)}
                      </span>
                    )}
                  </figcaption>
                </>
              ) : (
                <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-xl border border-dashed border-border">
                  <div className="hatch absolute inset-0 opacity-40" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <p className="font-display text-lg tracking-tight text-secondary">
                      {scene.title}
                    </p>
                    <p className="text-xs text-secondary">
                      No frame yet — generate one from the inspector.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={SPRING}
            className="flex h-full w-full flex-col items-center justify-center gap-4 text-center"
          >
            <div className="relative aspect-video w-[420px] max-w-full overflow-hidden rounded-xl border border-dashed border-border">
              <div className="hatch absolute inset-0 opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs text-secondary">No scenes on the timeline</p>
              </div>
            </div>
            <button
              onClick={onOpenScript}
              className="flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm text-secondary transition-colors hover:border-secondary/40 hover:text-primary"
            >
              <FileText className="h-4 w-4" strokeWidth={1.75} />
              {script && script.wordCount > 0
                ? `Open script · ${countWords(script.content).toLocaleString()} words · ${formatDuration(scriptSeconds)}`
                : "Write the script"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
