"use client";

import { forwardRef, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Scene, Script } from "@foundry/shared-types";
import {
  activeAssetOf,
  estimateSeconds,
  formatDuration,
  formatSceneDuration,
  hasDurationMismatch,
  sceneDuration,
} from "@foundry/shared-types";
import { AlertTriangle, ImageIcon, Minus, Plus, Upload } from "lucide-react";
import { PreviewPlayer } from "@/components/editor/preview-player";
import { AssetMedia } from "@/components/scenes/asset-media";
import { ReadinessBadge } from "@/components/editor/readiness-badge";
import { SPRING, StatusDot } from "@/components/ui/primitives";
import { DEFAULT_TIMELINE_ZOOM, useEditor } from "@/lib/editor-store";
import { useReorderScenes } from "@/lib/queries/scenes";
import { useDragReorder } from "@/lib/use-drag-reorder";
import { useSceneDrop } from "@/lib/use-scene-drop";
import { cn } from "@/lib/utils";

interface TimelineProps {
  projectId: string;
  scenes: Scene[];
  script: Script | null;
}

const MIN_SCENE_WIDTH_PX = 60;
/** Уже этой ширины название всё равно превращается в «A…» — не показываем. */
const NARROW_SCENE_PX = 130;
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

  // Ширина блока — по источнику истины: если у сцены есть измеренный голос,
  // блок должен быть его длины, а не длины оценки по тексту.
  const durations = ordered.map((s) => sceneDuration(s).seconds);
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
        <PreviewPlayer scenes={ordered} />

        <span className="h-4 w-px bg-border" aria-hidden />

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
          {ordered.map((scene, i) => (
            <SceneCard
              key={scene.id}
              ref={(el) => {
                sceneRefs.current[scene.id] = el;
              }}
              projectId={projectId}
              scene={scene}
              durationSec={durations[i]}
              width={Math.max(durations[i] * timelineZoom, MIN_SCENE_WIDTH_PX)}
              selected={scene.id === selectedSceneId}
              dragging={draggingId === scene.id}
              dragProps={dragProps(scene.id)}
              onSelect={() =>
                setSelectedSceneId(
                  scene.id === selectedSceneId ? null : scene.id,
                )
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface SceneCardProps {
  projectId: string;
  scene: Scene;
  durationSec: number;
  width: number;
  selected: boolean;
  dragging: boolean;
  dragProps: ReturnType<ReturnType<typeof useDragReorder>["dragProps"]>;
  onSelect: () => void;
}

/**
 * Блок сцены на таймлайне. Принимает файл прямо на себя: перетащить mp4 на
 * сцену быстрее, чем открывать инспектор и искать там вкладку Upload.
 */
const SceneCard = forwardRef<HTMLDivElement, SceneCardProps>(function SceneCard(
  {
    projectId,
    scene,
    durationSec,
    width,
    selected,
    dragging,
    dragProps,
    onSelect,
  },
  ref,
) {
  const drop = useSceneDrop(projectId, scene.id);

  const activeVideo = activeAssetOf(scene, "VIDEO");
  const activeFrame = activeAssetOf(scene, "IMAGE");
  // Для миниатюры кадр предпочтительнее клипа: картинка рисуется сразу,
  // видео сначала тянет метаданные ради первого кадра.
  const thumb =
    (activeFrame?.status === "READY" && activeFrame.url ? activeFrame : null) ??
    (activeVideo?.status === "READY" && activeVideo.url ? activeVideo : null);

  return (
    <motion.div
      ref={ref}
      layout
      transition={SPRING}
      {...dragProps}
      {...drop.dropProps}
      onClick={onSelect}
      className={cn(
        "group relative flex h-full shrink-0 cursor-grab flex-col overflow-hidden rounded-md border bg-surface text-left transition-all active:cursor-grabbing",
        selected
          ? "border-accent shadow-subtle ring-2 ring-accent/30"
          : "border-border hover:border-secondary/40 hover:shadow-subtle",
        dragging && "opacity-50",
        drop.over && "border-accent ring-2 ring-accent/40",
      )}
      style={{ width: `${width}px` }}
      role="button"
      aria-label={`Scene ${scene.order + 1}: ${scene.title}`}
    >
      <div className="relative min-h-0 flex-1 bg-bg">
        {thumb ? (
          <div className="pointer-events-none absolute inset-0">
            <AssetMedia asset={thumb} controls={false} />
          </div>
        ) : (
          <>
            <div className="hatch absolute inset-0 opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-secondary/40" strokeWidth={1.5} />
            </div>
          </>
        )}

        {/* Номер и длительность — на кадре: в подписи снизу они отнимали
            место у названия и на узких сценах его съедали. */}
        <span className="absolute left-1.5 top-1.5 rounded-sm bg-surface/85 px-1.5 py-0.5 font-display text-sm leading-none tabular-nums text-primary backdrop-blur-[2px]">
          {String(scene.order + 1).padStart(2, "0")}
        </span>
        <span className="absolute bottom-1.5 right-1.5 rounded-sm bg-surface/85 px-1.5 py-0.5 text-xs leading-none tabular-nums text-secondary backdrop-blur-[2px]">
          {formatSceneDuration(durationSec)}
        </span>

        {(drop.over || drop.uploading) && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-surface/85 backdrop-blur-[2px]">
            <span className="flex items-center gap-1.5 text-xs text-accent">
              <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
              {drop.uploading ? "Uploading…" : "Drop to add"}
            </span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 border-t border-border px-2 py-1.5">
        <StatusDot tone={STATUS_TONE[scene.status]} />
        {/* Ассеты видны только при открытой сцене, поэтому расхождение
            длительностей помечается и здесь — иначе его замечают уже в
            монтаже. */}
        {hasDurationMismatch(scene) && (
          <span
            title="Duration mismatch between the scene and its video or music"
            className="shrink-0 text-accent"
          >
            <AlertTriangle className="h-3 w-3" strokeWidth={2} />
          </span>
        )}
        {width >= NARROW_SCENE_PX && (
          <span
            title={scene.title}
            className="min-w-0 flex-1 truncate text-xs font-medium text-primary"
          >
            {drop.rejected ? "Unsupported file" : scene.title}
          </span>
        )}
        <ReadinessBadge scene={scene} className="ml-auto" />
      </div>
    </motion.div>
  );
});
