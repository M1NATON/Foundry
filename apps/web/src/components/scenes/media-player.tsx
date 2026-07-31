"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { formatDuration } from "@foundry/shared-types";
import { cn } from "@/lib/utils";

interface MediaPlayerProps {
  src: string;
  kind: "video" | "audio";
  /** Без контролов — немой кадр для миниатюр. */
  controls?: boolean;
  className?: string;
}

/**
 * Плеер клипов и аудио с собственными контролами: нативные рисуются
 * средствами ОС и выпадают из палитры проекта. Кадр всегда вписывается
 * в отведённое место целиком (object-contain), а панель лежит поверх —
 * при паузе видна всегда, во время проигрывания появляется по наведению.
 */
export function MediaPlayer({
  src,
  kind,
  controls = true,
  className,
}: MediaPlayerProps) {
  const mediaRef = useRef<HTMLVideoElement & HTMLAudioElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(!controls);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // Смена ассета в том же слоте не должна оставлять счётчик от прошлого.
  useEffect(() => {
    setCurrent(0);
    setDuration(0);
    setPlaying(false);
  }, [src]);

  useEffect(() => {
    function onChange() {
      setFullscreen(document.fullscreenElement === wrapperRef.current);
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function toggle() {
    const media = mediaRef.current;
    if (!media) return;
    if (media.paused) void media.play().catch(() => undefined);
    else media.pause();
  }

  function seekToRatio(ratio: number) {
    const media = mediaRef.current;
    if (!media || !duration) return;
    media.currentTime = Math.min(Math.max(ratio, 0), 1) * duration;
  }

  const progress = duration > 0 ? current / duration : 0;

  const mediaProps = {
    ref: mediaRef,
    src,
    preload: "metadata" as const,
    onLoadedMetadata: () => setDuration(mediaRef.current?.duration ?? 0),
    onTimeUpdate: () => setCurrent(mediaRef.current?.currentTime ?? 0),
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onEnded: () => setPlaying(false),
  };

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "group/player relative flex h-full w-full items-center justify-center overflow-hidden",
        kind === "audio" && "bg-bg",
        className,
      )}
    >
      {kind === "video" ? (
        <video
          {...mediaProps}
          muted={muted}
          playsInline
          onClick={() => controls && toggle()}
          className={cn(
            "max-h-full max-w-full object-contain",
            controls && "cursor-pointer",
          )}
        />
      ) : (
        <>
          <audio {...mediaProps} muted={muted} className="hidden" />
          <div className="hatch absolute inset-0 opacity-30" aria-hidden />
        </>
      )}

      {controls && (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex items-center gap-2.5 px-3 py-2",
            "border-t border-border bg-surface/90 backdrop-blur transition-opacity",
            playing && "opacity-0 group-hover/player:opacity-100",
          )}
        >
          <button
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className="shrink-0 text-secondary transition-colors hover:text-primary"
          >
            {playing ? (
              <Pause className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Play className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>

          <Scrubber progress={progress} onSeek={seekToRatio} />

          <span className="shrink-0 text-xs tabular-nums text-secondary">
            {formatDuration(current)} / {formatDuration(duration)}
          </span>

          <button
            onClick={() => {
              const next = !muted;
              setMuted(next);
              if (mediaRef.current) mediaRef.current.muted = next;
            }}
            aria-label={muted ? "Unmute" : "Mute"}
            className="shrink-0 text-secondary transition-colors hover:text-primary"
          >
            {muted ? (
              <VolumeX className="h-3.5 w-3.5" strokeWidth={1.75} />
            ) : (
              <Volume2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
          </button>

          {kind === "video" && (
            <button
              onClick={() => {
                if (document.fullscreenElement) void document.exitFullscreen();
                else void wrapperRef.current?.requestFullscreen().catch(() => undefined);
              }}
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              className="shrink-0 text-secondary transition-colors hover:text-primary"
            >
              {fullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Дорожка перемотки: тянется мышью и слушает стрелки с клавиатуры. */
function Scrubber({
  progress,
  onSeek,
}: {
  progress: number;
  onSeek: (ratio: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function seekFromEvent(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    onSeek((clientX - rect.left) / rect.width);
  }

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        seekFromEvent(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) seekFromEvent(e.clientX);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") onSeek(progress - 0.05);
        if (e.key === "ArrowRight") onSeek(progress + 0.05);
      }}
      className="group/scrub relative h-4 min-w-0 flex-1 cursor-pointer outline-none"
    >
      <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-border">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }}
        />
      </div>
      <span
        className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full
                   bg-accent opacity-0 transition-opacity group-hover/scrub:opacity-100"
        style={{ left: `${Math.min(Math.max(progress, 0), 1) * 100}%` }}
        aria-hidden
      />
    </div>
  );
}
