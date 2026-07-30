"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Scene, Script } from "@foundry/shared-types";
import {
  countWords,
  estimateSeconds,
  formatDuration,
} from "@foundry/shared-types";
import { SPRING, StatusDot } from "@/components/ui/primitives";
import { useEditor } from "@/lib/editor-store";
import { useReorderScenes } from "@/lib/queries/scenes";
import { cn } from "@/lib/utils";

interface TimelineProps {
  projectId: string;
  scenes: Scene[];
  script: Script | null;
}

const MIN_SCENE_SEC = 3;
const MIN_SCENE_WIDTH_PX = 60;
const MIN_ZOOM = 10;
const MAX_ZOOM = 200;

const STATUS_TONE: Record<
  Scene["status"],
  "idle" | "active" | "done" | "error"
> = {
  PENDING: "idle",
  GENERATING: "active",
  READY: "done",
  FAILED: "error",
};

function sceneDuration(scene: Scene): number {
  if (scene.durationSec != null)
    return Math.max(MIN_SCENE_SEC, scene.durationSec);
  const fallback = estimateSeconds(countWords(scene.voiceText));
  return Math.max(MIN_SCENE_SEC, fallback);
}

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

  // Локальный порядок во время перетаскивания — карточка не «прыгает».
  const [dragOrder, setDragOrder] = useState<string[] | null>(null);
  const dragId = useRef<string | null>(null);

  const ordered =
    dragOrder != null
      ? [...scenes].sort(
          (a, b) => dragOrder.indexOf(a.id) - dragOrder.indexOf(b.id),
        )
      : scenes;

  const durations = ordered.map(sceneDuration);
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
      setTimelineZoom((z) =>
        Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + e.deltaY * -0.1)),
      );
    }
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [setTimelineZoom]);

  function handleDragStart(id: string) {
    dragId.current = id;
    setDragOrder(ordered.map((s) => s.id));
  }

  function handleDragEnter(targetId: string) {
    const from = dragId.current;
    if (!from || from === targetId) return;
    setDragOrder((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const a = next.indexOf(from);
      const b = next.indexOf(targetId);
      next.splice(a, 1);
      next.splice(b, 0, from);
      return next;
    });
  }

  function handleDragEnd() {
    const finalOrder = dragOrder;
    dragId.current = null;
    setDragOrder(null);
    if (!finalOrder) return;
    const changed = finalOrder
      .map((id, idx) => ({ sceneId: id, newOrder: idx }))
      .filter(({ sceneId, newOrder }) => {
        const scene = scenes.find((s) => s.id === sceneId);
        return scene !== undefined && scene.order !== newOrder;
      });
    if (changed.length > 0) reorder.mutate(changed);
  }

  return (
    <section className="shrink-0 border-t border-border bg-surface">
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
          <span className="absolute right-3 top-0 flex h-full items-center text-xs tabular-nums text-secondary">
            {formatDuration(totalSec)} total
          </span>
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
            const dragging = dragId.current === scene.id;
            const thumb = scene.assets.find(
              (a) =>
                a.status === "READY" &&
                a.url &&
                (a.type === "IMAGE" || a.type === "VIDEO"),
            );
            return (
              <motion.div
                key={scene.id}
                layout
                transition={SPRING}
                draggable
                onDragStart={() => handleDragStart(scene.id)}
                onDragEnter={() => handleDragEnter(scene.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
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
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-primary">
                    {scene.title}
                  </span>
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
