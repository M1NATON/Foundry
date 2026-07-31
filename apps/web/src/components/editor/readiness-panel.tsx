"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ImageIcon, Mic, Video, Wand2 } from "lucide-react";
import type { AssetType, ProjectGap, Scene } from "@foundry/shared-types";
import { gapLabel, projectGaps } from "@foundry/shared-types";
import { Button } from "@/components/ui/button";
import { SPRING } from "@/components/ui/primitives";
import { useEditor } from "@/lib/editor-store";
import { useGenerateMissing } from "@/lib/queries/scenes";
import { cn } from "@/lib/utils";

interface ReadinessPanelProps {
  projectId: string;
  scenes: Scene[];
  open: boolean;
  onClose: () => void;
}

/** Пакетная генерация — по одному типу за раз: очередь и так их разложит. */
const BATCH: Array<{ type: AssetType; label: string; icon: typeof ImageIcon }> = [
  { type: "IMAGE", label: "Frames", icon: ImageIcon },
  { type: "VIDEO", label: "Clips", icon: Video },
  { type: "VOICE", label: "Voice", icon: Mic },
];

/**
 * Что осталось до экспорта. Пробелы группируются по типу, а не по сценам:
 * «нет кадра в шести сценах» — это одна задача на пакетную генерацию, а
 * список из шести строк в этом месте только мешает.
 */
export function ReadinessPanel({
  projectId,
  scenes,
  open,
  onClose,
}: ReadinessPanelProps) {
  const generateMissing = useGenerateMissing(projectId);
  const { setSelectedSceneId, setStep } = useEditor();
  const [expanded, setExpanded] = useState<ProjectGap["kind"] | null>(null);

  const gaps = projectGaps(scenes);
  const byKind = new Map<ProjectGap["kind"], ProjectGap[]>();
  for (const gap of gaps) {
    byKind.set(gap.kind, [...(byKind.get(gap.kind) ?? []), gap]);
  }

  function openScene(sceneId: string) {
    setSelectedSceneId(sceneId);
    setStep("producing");
    onClose();
  }

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
            className="fixed inset-0 z-50 bg-primary/10"
          />
          <motion.div
            role="dialog"
            aria-label="Readiness"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={SPRING}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[80vh] w-[520px] -translate-x-1/2
                       -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border
                       bg-surface shadow-subtle"
          >
            <div className="shrink-0 border-b border-border px-5 py-4">
              <h2 className="font-display text-lg tracking-tight">
                Before you export
              </h2>
              <p className="mt-1 text-xs text-secondary">
                {scenes.length} scene{scenes.length === 1 ? "" : "s"} ·{" "}
                {gaps.length === 0
                  ? "nothing missing"
                  : `${gaps.length} thing${gaps.length === 1 ? "" : "s"} to fix`}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {gaps.length === 0 ? (
                <div className="flex items-center gap-2.5 rounded-md border border-border px-3 py-4">
                  <Check className="h-4 w-4 text-accent" strokeWidth={2} />
                  <p className="text-sm text-secondary">
                    Every scene has its picture, voice and prompts.
                  </p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {[...byKind.entries()].map(([kind, items]) => (
                    <li
                      key={kind}
                      className="rounded-md border border-border px-3 py-2.5"
                    >
                      <button
                        onClick={() =>
                          setExpanded(expanded === kind ? null : kind)
                        }
                        className="flex w-full items-center gap-2 text-left"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm text-primary">
                          {gapLabel(kind)}
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-secondary">
                          {items.length} scene{items.length === 1 ? "" : "s"}
                        </span>
                      </button>

                      {expanded === kind && (
                        <ul className="mt-2 space-y-1 border-t border-border pt-2">
                          {items.map((gap) => (
                            <li key={`${gap.sceneId}-${gap.kind}`}>
                              <button
                                onClick={() => openScene(gap.sceneId)}
                                className="flex w-full items-baseline gap-2 rounded-sm px-1 py-0.5
                                           text-left text-xs text-secondary transition-colors
                                           hover:bg-bg hover:text-primary"
                              >
                                <span className="shrink-0 tabular-nums">
                                  {String(gap.sceneOrder + 1).padStart(2, "0")}
                                </span>
                                <span className="min-w-0 flex-1 truncate">
                                  {gap.sceneTitle}
                                </span>
                                {gap.detail && (
                                  <span className="shrink-0 tabular-nums">
                                    {gap.detail}
                                  </span>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="shrink-0 border-t border-border px-5 py-3">
              <p className="mb-2 text-xs uppercase tracking-tight text-secondary">
                Fill the gaps
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {BATCH.map(({ type, label, icon: Icon }) => (
                  <Button
                    key={type}
                    size="sm"
                    variant="secondary"
                    onClick={() => generateMissing.mutate([type])}
                    disabled={generateMissing.isPending || scenes.length === 0}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {label}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() =>
                    generateMissing.mutate(BATCH.map((b) => b.type))
                  }
                  disabled={generateMissing.isPending || scenes.length === 0}
                >
                  <Wand2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {generateMissing.isPending ? "Queueing…" : "Everything"}
                </Button>
              </div>

              {generateMissing.data && (
                <p
                  className={cn(
                    "mt-2 text-xs",
                    generateMissing.data.queued > 0
                      ? "text-secondary"
                      : "text-accent",
                  )}
                >
                  Queued {generateMissing.data.queued}
                  {generateMissing.data.skipped > 0 &&
                    ` · skipped ${generateMissing.data.skipped} without a prompt`}
                </p>
              )}
              {generateMissing.isError && (
                <p className="mt-2 text-xs text-accent">
                  Could not queue the batch — try again.
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
