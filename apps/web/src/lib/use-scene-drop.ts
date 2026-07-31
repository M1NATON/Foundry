"use client";

import { useState } from "react";
import type { AssetType } from "@foundry/shared-types";
import { useUploadAsset } from "@/lib/queries/scenes";

/** Расширение → тип слота. Голос и музыка неразличимы по файлу. */
const TYPE_BY_EXT: Record<string, AssetType> = {
  png: "IMAGE",
  jpg: "IMAGE",
  jpeg: "IMAGE",
  webp: "IMAGE",
  gif: "IMAGE",
  mp4: "VIDEO",
  webm: "VIDEO",
  mov: "VIDEO",
  mp3: "VOICE",
  wav: "VOICE",
  ogg: "VOICE",
  m4a: "VOICE",
  flac: "VOICE",
};

export function assetTypeOfFile(name: string): AssetType | null {
  const ext = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  return TYPE_BY_EXT[ext] ?? null;
}

/**
 * Перетаскивание файла прямо на сцену. Тип слота определяется по
 * расширению: аудио уходит в голос — музыку кладут заметно реже, и
 * перевесить её потом можно в инспекторе.
 *
 * dragDepth, а не булев флаг: dragleave стреляет и при переходе на
 * дочерний элемент, из-за чего подсветка мигала на каждой границе.
 */
export function useSceneDrop(projectId: string, sceneId: string | null) {
  const upload = useUploadAsset(projectId);
  const [depth, setDepth] = useState(0);
  const [rejected, setRejected] = useState<string | null>(null);

  function reset() {
    setDepth(0);
  }

  const dropProps = {
    onDragEnter: (e: React.DragEvent) => {
      if (!sceneId || !e.dataTransfer.types.includes("Files")) return;
      e.preventDefault();
      setDepth((d) => d + 1);
    },
    onDragOver: (e: React.DragEvent) => {
      if (!sceneId || !e.dataTransfer.types.includes("Files")) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: () => setDepth((d) => Math.max(0, d - 1)),
    onDrop: (e: React.DragEvent) => {
      if (!sceneId) return;
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      e.preventDefault();
      reset();

      const type = assetTypeOfFile(file.name);
      if (!type) {
        setRejected(file.name);
        return;
      }
      setRejected(null);
      upload.mutate({ sceneId, type, file });
    },
  };

  return {
    dropProps,
    over: depth > 0,
    uploading: upload.isPending,
    rejected,
    clearRejected: () => setRejected(null),
  };
}
