"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { Scene } from "@foundry/shared-types";
import {
  activeAssetOf,
  activeProjectMusic,
  sceneDuration,
} from "@foundry/shared-types";
import { useEditor } from "@/lib/editor-store";
import { useProjectMusic } from "@/lib/queries/music";

interface PreviewPlayerProps {
  projectId: string;
  scenes: Scene[];
}

interface PlannedScene {
  id: string;
  durationMs: number;
  voiceUrl: string | null;
  /** Своя музыка сцены; когда её нет — звучит базовый трек проекта. */
  overrideMusicUrl: string | null;
}

/** Фоновая музыка не должна перекрикивать начитку. */
const MUSIC_VOLUME = 0.35;

function plan(scenes: Scene[]): PlannedScene[] {
  return scenes.map((scene) => ({
    id: scene.id,
    durationMs: sceneDuration(scene).seconds * 1000,
    voiceUrl: readyUrl(scene, "VOICE"),
    overrideMusicUrl: readyUrl(scene, "MUSIC"),
  }));
}

function readyUrl(scene: Scene, type: "VOICE" | "MUSIC"): string | null {
  const asset = activeAssetOf(scene, type);
  return asset?.status === "READY" ? asset.url : null;
}

/**
 * Черновой предпросмотр ролика до сборки в DaVinci: сцены сменяются по
 * своей длительности, под каждую играют её голос и музыка. План сцен
 * снимается на старте — иначе фоновое обновление кеша (поллинг статусов
 * генерации) перезапускало бы таймер текущей сцены.
 */
export function PreviewPlayer({ projectId, scenes }: PreviewPlayerProps) {
  const { setSelectedSceneId } = useEditor();
  const { data: music } = useProjectMusic(projectId);
  const [index, setIndex] = useState<number | null>(null);
  const planRef = useRef<PlannedScene[]>([]);
  const baseTrackRef = useRef<HTMLAudioElement | null>(null);

  const projectTrack = music ? activeProjectMusic(music) : null;

  useEffect(() => {
    if (index === null) return;

    const scene = planRef.current[index];
    if (!scene) {
      setIndex(null);
      return;
    }

    setSelectedSceneId(scene.id);

    // Базовый трек не перезапускается на каждой сцене — он тянется сквозь
    // весь ролик. Сцена со своей музыкой глушит его, а не останавливает:
    // после неё он должен продолжиться там же, где и в экспорте.
    if (baseTrackRef.current) {
      baseTrackRef.current.volume = scene.overrideMusicUrl ? 0 : MUSIC_VOLUME;
    }

    const playing = [
      startAudio(scene.voiceUrl, 1),
      startAudio(scene.overrideMusicUrl, MUSIC_VOLUME),
    ].filter((a): a is HTMLAudioElement => a !== null);
    const timer = setTimeout(() => setIndex(index + 1), scene.durationMs);

    return () => {
      clearTimeout(timer);
      for (const audio of playing) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [index, setSelectedSceneId]);

  // Остановка (в том числе по концу ролика) снимает и базовый трек.
  useEffect(() => {
    if (index !== null) return;
    stopAudio(baseTrackRef.current);
    baseTrackRef.current = null;
  }, [index]);

  useEffect(() => () => stopAudio(baseTrackRef.current), []);

  const playing = index !== null;

  function toggle() {
    if (playing) {
      setIndex(null);
      return;
    }
    if (scenes.length === 0) return;
    planRef.current = plan(scenes);
    baseTrackRef.current =
      projectTrack?.status === "READY"
        ? startAudio(projectTrack.url, MUSIC_VOLUME)
        : null;
    setIndex(0);
  }

  return (
    <button
      onClick={toggle}
      disabled={scenes.length === 0}
      aria-label={playing ? "Stop preview" : "Play preview"}
      title="Rough preview: scenes advance by their duration, with voice and music"
      className="flex items-center gap-1.5 rounded-sm px-1.5 py-1 text-xs text-secondary
                 transition-colors hover:bg-border/40 hover:text-primary disabled:opacity-40"
    >
      {playing ? (
        <Pause className="h-3.5 w-3.5" strokeWidth={1.75} />
      ) : (
        <Play className="h-3.5 w-3.5" strokeWidth={1.75} />
      )}
      {playing ? "Stop" : "Preview"}
    </button>
  );
}

function stopAudio(audio: HTMLAudioElement | null): void {
  if (!audio) return;
  audio.pause();
  audio.src = "";
}

function startAudio(url: string | null, volume: number): HTMLAudioElement | null {
  if (!url) return null;
  const audio = new Audio(url);
  audio.volume = volume;
  // Автовоспроизведение может быть отклонено политикой браузера — тогда
  // предпросмотр остаётся немой сменой кадров, но не падает.
  void audio.play().catch(() => undefined);
  return audio;
}
