"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Music, Trash2, Upload, Wand2 } from "lucide-react";
import type { Asset, Scene } from "@foundry/shared-types";
import {
  activeAssetOf,
  activeProjectMusic,
  formatSceneDuration,
  hasMusicOverride,
  isAssetPending,
  projectMusicShortfall,
} from "@foundry/shared-types";
import { Button } from "@/components/ui/button";
import { useSetActiveAsset, useUploadAsset } from "@/lib/queries/scenes";
import {
  useDeleteProjectMusic,
  useGenerateProjectMusic,
  useProjectMusic,
  useSetProjectMusic,
  useUploadProjectMusic,
} from "@/lib/queries/music";
import { cn } from "@/lib/utils";

/** Те же отступы и зазор, что у ряда сцен — дорожка обязана совпадать с ним. */
const TRACK_PAD_PX = 12;
const TRACK_GAP_PX = 6;
const MIN_SCENE_WIDTH_PX = 60;

interface LaneProps {
  projectId: string;
  scenes: Scene[];
  durations: number[];
  zoom: number;
  width: number;
}

/**
 * Дорожка музыки под сценами. Базовый трек проекта идёт сплошной полосой
 * поперёк нарезки — он не принадлежит ни одной сцене; сцена со своим треком
 * перекрывает его на своём отрезке, ровно как и в экспорте.
 */
export function MusicLane({
  projectId,
  scenes,
  durations,
  zoom,
  width,
}: LaneProps) {
  const { data } = useProjectMusic(projectId);
  const track = data ? activeProjectMusic(data) : null;

  // Раскладка повторяет ряд сцен, а не линейку: у узкой сцены ширина
  // упирается в минимум, и время перестаёт быть пропорционально пикселям.
  const spans: Array<{ left: number; width: number }> = [];
  let x = TRACK_PAD_PX;
  for (let i = 0; i < scenes.length; i++) {
    const w = Math.max(durations[i] * zoom, MIN_SCENE_WIDTH_PX);
    spans.push({ left: x, width: w });
    x += w + TRACK_GAP_PX;
  }
  const endX = spans.length ? x - TRACK_GAP_PX : TRACK_PAD_PX;
  const totalSec = durations.reduce((a, b) => a + b, 0);

  function xAtTime(seconds: number): number {
    let acc = 0;
    for (let i = 0; i < spans.length; i++) {
      const d = durations[i];
      if (seconds <= acc + d) {
        const within = d > 0 ? (seconds - acc) / d : 0;
        return spans[i].left + within * spans[i].width;
      }
      acc += d;
    }
    return endX;
  }

  // Длительность заглушки неизвестна — показываем её на всю длину, как и в
  // экспорте, чтобы дорожка не врала про тишину, которой не будет.
  const baseSec = track?.durationSec ?? totalSec;
  const baseEndX = xAtTime(Math.min(baseSec, totalSec));

  return (
    <div
      className="relative h-11 border-t border-border"
      style={{ width: `${width}px` }}
      aria-label="Music track"
    >
      <span className="absolute left-3 top-1 text-xs text-secondary">
        Music
      </span>

      {track ? (
        <div
          className="absolute top-5 flex h-5 items-center overflow-hidden rounded-sm
                     border border-accent/30 bg-accent-soft px-2"
          style={{ left: `${TRACK_PAD_PX}px`, width: `${Math.max(baseEndX - TRACK_PAD_PX, 2)}px` }}
          title={`${track.prompt} — plays across the whole timeline`}
        >
          <span className="truncate text-xs text-primary">{track.prompt}</span>
        </div>
      ) : (
        <div
          className="absolute top-5 h-5 rounded-sm border border-dashed border-border"
          style={{ left: `${TRACK_PAD_PX}px`, width: `${Math.max(endX - TRACK_PAD_PX, 2)}px` }}
        />
      )}

      {/* Сцены со своей музыкой — поверх базовой: она в это время не звучит. */}
      {scenes.map((scene, i) =>
        hasMusicOverride(scene) ? (
          <div
            key={scene.id}
            className="absolute top-5 flex h-5 items-center overflow-hidden rounded-sm
                       border border-secondary/40 bg-surface px-2"
            style={{ left: `${spans[i].left}px`, width: `${spans[i].width}px` }}
            title={`Scene ${scene.order + 1} plays its own music`}
          >
            <Music className="h-3 w-3 shrink-0 text-secondary" strokeWidth={1.75} />
          </div>
        ) : null,
      )}
    </div>
  );
}

interface BarProps {
  projectId: string;
  totalSec: number;
}

/**
 * Управление базовым треком. Живёт под таймлайном, а не в инспекторе сцены:
 * это свойство всего проекта, и привязывать его к выбранной сцене значило бы
 * повторить ту же ошибку, из-за которой музыка была слотом сцены.
 */
export function MusicBar({ projectId, totalSec }: BarProps) {
  const { data } = useProjectMusic(projectId);
  const generate = useGenerateProjectMusic(projectId);
  const upload = useUploadProjectMusic(projectId);
  const setActive = useSetProjectMusic(projectId);
  const remove = useDeleteProjectMusic(projectId);
  const fileInput = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState("");

  const track = data ? activeProjectMusic(data) : null;
  const pending = data?.assets.find((a) => isAssetPending(a.status)) ?? null;
  const shortfall = projectMusicShortfall(track, totalSec);
  const others = (data?.assets ?? []).filter((a) => a.id !== track?.id);

  function submitPrompt() {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    generate.mutate({ type: "MUSIC", prompt: trimmed, provider: "gemini" });
    setPrompt("");
  }

  return (
    <div className="border-t border-border px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <Music className="h-3.5 w-3.5 shrink-0 text-secondary" strokeWidth={1.75} />

        {track ? (
          <>
            <span className="min-w-0 max-w-[220px] truncate text-xs text-primary">
              {track.prompt}
            </span>
            {track.durationSec != null && (
              <span className="shrink-0 text-xs tabular-nums text-secondary">
                {formatSceneDuration(track.durationSec)}
              </span>
            )}
          </>
        ) : pending ? (
          <span className="text-xs text-secondary">Generating the track…</span>
        ) : (
          <span className="text-xs text-secondary">
            No music on this project
          </span>
        )}

        {shortfall != null && (
          <span
            className="flex shrink-0 items-center gap-1 text-xs text-accent"
            title="The track is laid down once, not looped — the tail stays silent"
          >
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} />
            {formatSceneDuration(shortfall)} without music
          </span>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitPrompt()}
            placeholder="Describe the score…"
            className="w-44 rounded-sm border border-border bg-bg px-2 py-1 text-xs
                       text-primary outline-none placeholder:text-secondary
                       focus:border-secondary/40"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={submitPrompt}
            disabled={generate.isPending || !prompt.trim()}
          >
            <Wand2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Generate
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fileInput.current?.click()}
            disabled={upload.isPending}
          >
            <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
            {upload.isPending ? "Uploading…" : "Upload"}
          </Button>
          {track && (
            <button
              onClick={() => remove.mutate(track.id)}
              aria-label="Remove project music"
              className="rounded-sm p-1 text-secondary transition-colors
                         hover:bg-border/40 hover:text-primary"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>

      {others.length > 0 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-secondary">Other takes:</span>
          {others.map((asset) => (
            <TakeChip
              key={asset.id}
              asset={asset}
              onPick={() => setActive.mutate(asset.id)}
            />
          ))}
        </div>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload.mutate(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/**
 * Музыка конкретной сцены. Намеренно не выглядит как Voiceover и промпты:
 * это не пробел, который надо закрыть, а исключение из общего трека — поэтому
 * пунктир, приглушённый тон и явная надпись про то, что играет по умолчанию.
 */
export function SceneMusicOverride({
  projectId,
  scene,
}: {
  projectId: string;
  scene: Scene;
}) {
  const { data } = useProjectMusic(projectId);
  const upload = useUploadAsset(projectId);
  const setActiveAsset = useSetActiveAsset(projectId);
  const fileInput = useRef<HTMLInputElement>(null);

  const override = activeAssetOf(scene, "MUSIC");
  const projectTrack = data ? activeProjectMusic(data) : null;

  return (
    <div className="rounded-md border border-dashed border-border px-3 py-2.5">
      <div className="flex items-center gap-2">
        <Music className="h-3.5 w-3.5 shrink-0 text-secondary" strokeWidth={1.75} />
        <p className="text-xs uppercase tracking-tight text-secondary">
          Music
        </p>
        <span className="text-xs text-secondary opacity-70">optional</span>
      </div>

      <p className="mt-1.5 text-xs text-secondary">
        {override
          ? "This scene plays its own track instead of the project one."
          : projectTrack
            ? `Plays the project track — ${projectTrack.prompt}.`
            : "No project track yet, so this scene is silent."}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          onClick={() => fileInput.current?.click()}
          disabled={upload.isPending}
          className="flex h-8 items-center gap-1.5 rounded-sm border border-dashed
                     border-border px-2.5 text-xs text-secondary transition-colors
                     hover:border-secondary/40 hover:text-primary disabled:opacity-50"
        >
          <Upload className="h-3 w-3" strokeWidth={1.75} />
          {upload.isPending
            ? "Uploading…"
            : override
              ? "Replace"
              : "Override for this scene"}
        </button>

        {override && (
          <button
            onClick={() =>
              setActiveAsset.mutate({
                sceneId: scene.id,
                dto: { type: "MUSIC", assetId: null },
              })
            }
            disabled={setActiveAsset.isPending}
            className="text-xs text-secondary underline-offset-2 transition-colors
                       hover:text-primary hover:underline disabled:opacity-50"
          >
            Back to project music
          </button>
        )}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            upload.mutate({ sceneId: scene.id, type: "MUSIC", file });
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}

function TakeChip({ asset, onPick }: { asset: Asset; onPick: () => void }) {
  const busy = isAssetPending(asset.status);

  return (
    <button
      onClick={onPick}
      disabled={busy}
      title={asset.prompt}
      className={cn(
        "max-w-[160px] truncate rounded-sm border border-border px-2 py-0.5 text-xs",
        "text-secondary transition-colors hover:border-secondary/40 hover:text-primary",
        busy && "opacity-50",
      )}
    >
      {busy ? "Generating…" : asset.prompt}
    </button>
  );
}
