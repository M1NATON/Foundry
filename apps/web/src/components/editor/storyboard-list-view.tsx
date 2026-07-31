"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GripVertical, Plus, Trash2, Wand2 } from "lucide-react";
import type { Scene, Script } from "@foundry/shared-types";
import { formatDuration, sceneDuration } from "@foundry/shared-types";
import { ReadinessBadge } from "@/components/editor/readiness-badge";
import { Button } from "@/components/ui/button";
import { SPRING } from "@/components/ui/primitives";
import { useEditor } from "@/lib/editor-store";
import {
  useCreateScene,
  useDeleteScene,
  useReorderScenes,
  useSplitIntoScenes,
  useUpdateScene,
} from "@/lib/queries/scenes";
import { useDragReorder } from "@/lib/use-drag-reorder";
import { cn } from "@/lib/utils";

interface StoryboardListViewProps {
  projectId: string;
  scenes: Scene[];
  script: Script | null;
}

/**
 * Этап Storyboard: только состав и порядок сцен — название, номер,
 * примерная длительность. Промптов, ассетов и генерации здесь нет,
 * это всё уровень Producing; клик по сцене туда и уводит.
 */
export function StoryboardListView({
  projectId,
  scenes,
  script,
}: StoryboardListViewProps) {
  const { setStep, setSelectedSceneId } = useEditor();
  const reorder = useReorderScenes(projectId);
  const createScene = useCreateScene(projectId);
  const split = useSplitIntoScenes(projectId);

  const { ordered, draggingId, dragProps } = useDragReorder(scenes, (items) =>
    reorder.mutate(items),
  );

  const totalSec = ordered.reduce(
    (sum, s) => sum + sceneDuration(s).seconds,
    0,
  );
  const hasScript = Boolean(script?.content.trim());

  function openInProducing(sceneId: string) {
    setSelectedSceneId(sceneId);
    setStep("producing");
  }

  return (
    <section
      className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-bg"
      aria-label="Storyboard"
    >
      <div className="mx-auto w-full max-w-2xl px-8 py-10">
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="font-display text-2xl tracking-tight">Storyboard</h1>
          <p className="text-xs tabular-nums text-secondary">
            {ordered.length} scene{ordered.length === 1 ? "" : "s"} ·{" "}
            {formatDuration(totalSec)}
          </p>
        </div>

        {ordered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm text-secondary">
              No scenes yet — split the script below, or import a storyboard
              from the toolbar.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {ordered.map((scene) => (
              <SceneListItem
                key={scene.id}
                projectId={projectId}
                scene={scene}
                dragging={draggingId === scene.id}
                dragProps={dragProps(scene.id)}
                onOpen={() => openInProducing(scene.id)}
              />
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => split.mutate()}
            disabled={split.isPending || !hasScript}
            title={hasScript ? undefined : "Write the script first"}
          >
            <Wand2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            {split.isPending ? "Splitting…" : "Split from script"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              createScene.mutate({ title: "New scene", voiceText: "" })
            }
            disabled={createScene.isPending}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Add scene
          </Button>
        </div>
      </div>
    </section>
  );
}

interface SceneListItemProps {
  projectId: string;
  scene: Scene;
  dragging: boolean;
  dragProps: ReturnType<ReturnType<typeof useDragReorder>["dragProps"]>;
  onOpen: () => void;
}

function SceneListItem({
  projectId,
  scene,
  dragging,
  dragProps,
  onOpen,
}: SceneListItemProps) {
  const updateScene = useUpdateScene(projectId);
  const deleteScene = useDeleteScene(projectId);
  const [draft, setDraft] = useState<string | null>(null);
  const duration = sceneDuration(scene);

  function commitTitle() {
    const trimmed = (draft ?? "").trim();
    setDraft(null);
    if (trimmed && trimmed !== scene.title) {
      updateScene.mutate({ id: scene.id, dto: { title: trimmed } });
    }
  }

  return (
    <motion.li
      layout
      transition={SPRING}
      {...dragProps}
      className={cn(
        "group flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2.5",
        "transition-colors hover:border-secondary/40",
        dragging && "opacity-50",
      )}
    >
      <span
        className="cursor-grab text-secondary/60 active:cursor-grabbing"
        aria-hidden
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.75} />
      </span>

      <span className="w-6 shrink-0 font-display text-sm tabular-nums text-secondary">
        {String(scene.order + 1).padStart(2, "0")}
      </span>

      {draft !== null ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setDraft(null);
          }}
          className="min-w-0 flex-1 border-b border-secondary/40 bg-transparent text-sm outline-none"
        />
      ) : (
        <button
          onClick={onOpen}
          onDoubleClick={(e) => {
            e.preventDefault();
            setDraft(scene.title);
          }}
          title={scene.title}
          className="min-w-0 flex-1 truncate text-left text-sm text-primary hover:text-accent"
        >
          {scene.title}
        </button>
      )}

      <ReadinessBadge scene={scene} />

      <span
        className="shrink-0 text-xs tabular-nums text-secondary"
        title={
          duration.source === "estimated"
            ? "Estimated from the voiceover text — no voice file yet"
            : "Measured from the chosen voice file"
        }
      >
        {duration.source === "estimated" && "~"}
        {formatDuration(duration.seconds)}
      </span>

      <button
        onClick={() => setDraft(scene.title)}
        className="shrink-0 text-xs text-secondary opacity-0 transition-opacity
                   hover:text-primary group-hover:opacity-100"
      >
        Rename
      </button>

      <button
        onClick={() => deleteScene.mutate(scene.id)}
        disabled={deleteScene.isPending}
        aria-label={`Delete ${scene.title}`}
        className="shrink-0 rounded-sm p-1 text-secondary opacity-0 transition-all
                   hover:bg-border/40 hover:text-error group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </motion.li>
  );
}
