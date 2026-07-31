"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, FileText, Mic, Music } from "lucide-react";
import type { Asset, Scene, Script } from "@foundry/shared-types";
import {
  activeAssetOf,
  activeProjectMusic,
  countWords,
  estimateSeconds,
  formatDuration,
  formatSceneDuration,
  musicForScene,
  sceneDuration,
} from "@foundry/shared-types";
import { useProjectMusic } from "@/lib/queries/music";
import { AutoGrowTextarea } from "@/components/ui/auto-grow-textarea";
import { AssetMedia } from "@/components/scenes/asset-media";
import { MediaPlayer } from "@/components/scenes/media-player";
import { SPRING } from "@/components/ui/primitives";
import { useSceneField } from "@/lib/use-scene-field";
import { cn } from "@/lib/utils";

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
  const { data: music } = useProjectMusic(projectId);
  const voice = useSceneField(projectId, scene, "voiceText");
  const imagePrompt = useSceneField(projectId, scene, "imagePrompt");
  const videoPrompt = useSceneField(projectId, scene, "videoPrompt");
  const [showPrompts, setShowPrompts] = useState(false);

  const activeVideo = scene && activeAssetOf(scene, "VIDEO");
  const activeFrame = scene && activeAssetOf(scene, "IMAGE");
  const clip =
    activeVideo?.status === "READY" && activeVideo.url ? activeVideo : null;
  const frame =
    activeFrame?.status === "READY" && activeFrame.url ? activeFrame : null;

  // Что показывать, когда у сцены есть и кадр, и клип. По умолчанию клип —
  // он ближе к финальному видео; выбор живёт до смены сцены.
  const [preferred, setPreferred] = useState<"frame" | "clip" | null>(null);
  useEffect(() => setPreferred(null), [scene?.id]);

  const showFrame = preferred === "frame" || (preferred === null && !clip);
  const keyArt = showFrame ? (frame ?? clip) : (clip ?? frame);

  const voiceTrack = readyTrack(scene, "VOICE");
  // Под сценой звучит её собственный трек, а если своего нет — проектный.
  const projectTrack = music ? activeProjectMusic(music) : null;
  const musicTrack = scene
    ? withUrl(musicForScene(scene, projectTrack))
    : null;

  const scriptSeconds = script ? estimateSeconds(script.wordCount) : 0;

  // Тот же источник истины, что в таймлайне и списке сцен: измеренный голос,
  // иначе оценка по тексту — а не сырое scene.durationSec.
  const duration = scene ? sceneDuration(scene) : null;

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
              <AutoGrowTextarea
                {...voice.fieldProps}
                placeholder="Write the voiceover for this scene…"
                spellCheck={false}
                className="w-full bg-transparent font-display text-lg
                           leading-relaxed tracking-tight outline-none
                           placeholder:text-secondary/70"
              />

              {/* Звук сцены слушается рядом с её текстом — раньше ради
                  этого приходилось открывать инспектор. */}
              {(voiceTrack || musicTrack) && (
                <div className="mt-6 space-y-3 border-t border-border pt-4">
                  {voiceTrack && (
                    <SceneTrack
                      label="Voice"
                      icon={Mic}
                      url={voiceTrack.url!}
                    />
                  )}
                  {musicTrack && (
                    <SceneTrack
                      label="Music"
                      icon={Music}
                      url={musicTrack.url!}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="relative flex min-w-0 flex-1 items-center justify-center bg-bg p-4">
              {frame && clip && (
                <div
                  className="absolute left-3 top-3 z-10 flex items-center gap-0.5 rounded-md
                             border border-border bg-surface/85 p-0.5 backdrop-blur"
                  role="group"
                  aria-label="Preview source"
                >
                  {(
                    [
                      ["frame", "Frame"],
                      ["clip", "Clip"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setPreferred(key)}
                      aria-pressed={showFrame === (key === "frame")}
                      className={cn(
                        "rounded-sm px-2.5 py-1 text-xs transition-colors",
                        showFrame === (key === "frame")
                          ? "bg-accent-soft text-accent"
                          : "text-secondary hover:text-primary",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowPrompts((v) => !v)}
                aria-pressed={showPrompts}
                className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-md
                           border border-border bg-surface/85 px-2.5 py-1.5 text-xs text-secondary
                           shadow-subtle backdrop-blur transition-colors hover:text-primary"
              >
                {showPrompts ? (
                  <EyeOff className="h-3 w-3" strokeWidth={1.75} />
                ) : (
                  <Eye className="h-3 w-3" strokeWidth={1.75} />
                )}
                {showPrompts ? "Hide prompts" : "Show prompts"}
              </button>

              {keyArt?.url ? (
                <>
                  <AssetMedia
                    asset={keyArt}
                    className="max-h-full max-w-full object-contain"
                  />
                  <figcaption className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-md bg-surface/90 px-3 py-1.5 text-xs text-secondary shadow-subtle backdrop-blur">
                    {scene.title}
                    {duration && (
                      <span className="ml-2 tabular-nums">
                        {duration.source === "estimated" && "~"}
                        {formatSceneDuration(duration.seconds)}
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

              {/* Оверлей, а не сдвиг канваса: при закрытой панели превью
                  не теряет ни пикселя высоты. */}
              <AnimatePresence>
                {showPrompts && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={SPRING}
                    // Непрозрачная плашка: поверх кадра полупрозрачный фон
                    // съедал подписи полей — их не было видно на видео.
                    className="absolute inset-x-0 bottom-0 max-h-[70%] overflow-y-auto
                               border-t border-border bg-surface p-4 shadow-subtle"
                  >
                    <p className="mb-3 text-xs uppercase tracking-tight text-secondary">
                      Prompts
                    </p>
                    <div className="grid gap-3 lg:grid-cols-2">
                      <PromptField label="Image prompt" field={imagePrompt} />
                      <PromptField label="Video prompt" field={videoPrompt} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

/**
 * Промпт прямо на канвасе — тот же useSceneField, что и в инспекторе,
 * так что правка видна в обоих местах сразу и уходит на сервер один раз.
 */
function PromptField({
  label,
  field,
}: {
  label: string;
  field: ReturnType<typeof useSceneField>;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-tight text-secondary">
        {label}
      </span>
      <textarea
        {...field.fieldProps}
        rows={3}
        spellCheck={false}
        placeholder={`Describe the ${label.toLowerCase()}…`}
        className="w-full resize-none rounded-md border border-border bg-bg px-3 py-2
                   text-sm leading-relaxed outline-none transition-colors
                   focus:border-secondary/40 placeholder:text-secondary/60"
      />
    </label>
  );
}

/** Готовая звуковая дорожка сцены выбранного типа, если она есть. */
function readyTrack(scene: Scene | null, type: "VOICE" | "MUSIC") {
  if (!scene) return null;
  return withUrl(activeAssetOf(scene, type));
}

/** Ассет, у которого действительно есть файл, — иначе играть нечего. */
function withUrl(asset: Asset | null) {
  return asset?.status === "READY" && asset.url ? asset : null;
}

/** Дорожка сцены рядом с её текстом: подпись плюс компактный плеер. */
function SceneTrack({
  label,
  icon: Icon,
  url,
}: {
  label: string;
  icon: typeof Mic;
  url: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex w-16 shrink-0 items-center gap-1.5 text-xs uppercase tracking-tight text-secondary">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        {label}
      </span>
      <MediaPlayer src={url} kind="audio" variant="inline" />
    </div>
  );
}
