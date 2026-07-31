"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Scene, Script } from "@foundry/shared-types";
import {
  activeAssetOf,
  estimateSeconds,
  formatDuration,
  sceneDurationSec,
} from "@foundry/shared-types";
import { Minus, Plus } from "lucide-react";
import { ReadinessBadge } from "@/components/editor/readiness-badge";
import { SPRING, StatusDot } from "@/components/ui/primitives";
import { DEFAULT_TIMELINE_ZOOM, useEditor } from "@/lib/editor-store";
import { useReorderScenes } from "@/lib/queries/scenes";
import { useDragReorder } from "@/lib/use-drag-reorder";
import { cn } from "@/lib/utils";

interface TimelineProps {
  projectId: string;
  scenes: Scene[];
  script: Script | null;
}

const MIN_SCENE_WIDTH_PX = 60;
const MIN_ZOOM = 10;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;

function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

const STATUS_TONE: Record<
  Scene["status"],
  "idle" | "active" | "done" | "error"
> = {
  PENDING: "idle",
  GENERATING: "active",
  READY: "done",
  FAILED: "error",
};

function tickStep(totalSec: number): number {
  if (totalSec <= 60) return 5;
  if (totalSec <= 180) return 10;
  if (totalSec <= 600) return 30;
  return 60;
}

export function Timeline({ projectId, scenes, script }: TimelineProps) {
  const { selectedSceneId, setSelectedSceneId, timelineZoom, setTimelineZoom } = useEditor();
  const reorder = useReorderScenes(projectId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { ordered, draggingId, dragProps } = useDragReorder(scenes, (items) =>
    reorder.mutate(items),
  );

  const durations = ordered.map(sceneDurationSec);
  const totalSec =
    durations.reduce((a, b) => a + b, 0) ||
    estimateSeconds(script?.wordCount ?? 0) ||
    60;
  const step = tickStep(totalSec);
  const tickCount = Math.ceil(totalSec / step);
  const trackWidth = Math.max(totalSec * timelineZoom, MIN_SCENE_WIDTH_PX);

  // Ctrl+колесо масштабирует таймлайн (px per second); обычный скролл остаётся горизонтальным.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function handler(e: WheelEvent) {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setTimelineZoom((z) => clampZoom(z + e.deltaY * -0.1));
    }
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [setTimelineZoom]);

  // Выбранная сцена может оказаться далеко за краем видимой области —
  // особенно после Alt+←/→ или клика по сцене в списке раскадровки.
  useEffect(() => {
    if (!selectedSceneId) return;
    sceneRefs.current[selectedSceneId]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedSceneId, timelineZoom]);

  return (
    <section className="shrink-0 border-t border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <button
          onClick={() => setTimelineZoom((z) => clampZoom(z - ZOOM_STEP))}
          disabled={timelineZoom <= MIN_ZOOM}
          aria-label="Zoom out"
          className="rounded-sm p-1 text-secondary transition-colors hover:bg-border/40
                     hover:text-primary disabled:opacity-40"
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
        <span className="w-10 text-center text-xs tabular-nums text-secondary">
          {Math.round((timelineZoom / DEFAULT_TIMELINE_ZOOM) * 100)}%
        </span>
        <button
          onClick={() => setTimelineZoom((z) => clampZoom(z + ZOOM_STEP))}
          disabled={timelineZoom >= MAX_ZOOM}
          aria-label="Zoom in"
          className="rounded-sm p-1 text-secondary transition-colors hover:bg-border/40
                     hover:text-primary disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
        <button
          onClick={() => setTimelineZoom(() => DEFAULT_TIMELINE_ZOOM)}
          className="text-xs text-secondary transition-colors hover:text-primary"
        >
          Reset
        </button>

        {/* Общая длительность закреплена справа и не участвует в
            позиционировании меток — иначе она наезжает на последнюю
            из них и читается как «00:40total». */}
        <div className="ml-auto shrink-0 border-l border-border pl-4 text-xs tabular-nums text-secondary">
          Total: {formatDuration(totalSec)}
        </div>
      </div>

      <div ref={scrollRef} className="overflow-x-auto">
        <div className="relative h-7 border-b border-border" style={{ width: `${trackWidth}px` }}>
          {Array.from({ length: tickCount + 1 }).map((_, i) => {
            const sec = i * step;
            if (sec > totalSec) return null;
            return (
              <span
                key={i}
                className="absolute top-0 flex h-full items-center border-l border-border pl-1.5"
                style={{ left: `${sec * timelineZoom}px` }}
              >
                <span className="text-xs tabular-nums text-secondary">
                  {formatDuration(sec)}
                </span>
              </span>
            );
          })}
        </div>

        <div
          className="flex h-44 items-stretch gap-1.5 px-3 py-3"
          style={{ width: `${trackWidth}px` }}
        >
          {ordered.length === 0 && (
            <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-border">
              <p className="text-sm text-secondary">
                Timeline is empty — split the script or import a storyboard.
              </p>
            </div>
          )}
          {ordered.map((scene, i) => {
            const sceneWidth = Math.max(durations[i] * timelineZoom, MIN_SCENE_WIDTH_PX);
            const selected = scene.id === selectedSceneId;
            const dragging = draggingId === scene.id;
            const activeVideo = activeAssetOf(scene, "VIDEO");
            const activeFrame = activeAssetOf(scene, "IMAGE");
            const thumb =
              (activeVideo?.status === "READY" && activeVideo.url ? activeVideo : null) ??
              (activeFrame?.status === "READY" && activeFrame.url ? activeFrame : null);
            return (
              <motion.div
                key={scene.id}
                ref={(el) => {
                  sceneRefs.current[scene.id] = el;
                }}
                layout
                transition={SPRING}
                {...dragProps(scene.id)}
                onClick={() => setSelectedSceneId(selected ? null : scene.id)}
                className={cn(
                  "group relative flex h-full shrink-0 cursor-grab flex-col overflow-hidden rounded-md border text-left transition-colors active:cursor-grabbing",
                  selected
                    ? "border-accent ring-2 ring-accent/40"
                    : "border-border hover:border-secondary/40",
                  dragging && "opacity-50",
                )}
                style={{ width: `${sceneWidth}px` }}
                role="button"
                aria-label={`Scene ${scene.order + 1}: ${scene.title}`}
              >
                <div className="relative min-h-0 flex-1">
                  {thumb?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb.url}
                      alt=""
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="hatch absolute inset-0 opacity-30" />
                  )}
                  <span
                    className={cn(
                      "absolute left-2 top-2 rounded-sm px-1.5 py-0.5 font-display text-sm tabular-nums leading-none",
                      thumb?.url
                        ? "bg-surface/85 text-primary backdrop-blur-[2px]"
                        : "text-secondary",
                    )}
                  >
                    {String(scene.order + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2 border-t border-border bg-surface px-2.5 py-2">
                  <StatusDot tone={STATUS_TONE[scene.status]} />
                  <span
                    title={scene.title}
                    className="min-w-0 flex-1 truncate text-xs font-medium text-primary"
                  >
                    {scene.title}
                  </span>
                  <ReadinessBadge scene={scene} />
                  <span className="shrink-0 text-xs tabular-nums text-secondary">
                    {formatDuration(durations[i])}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
