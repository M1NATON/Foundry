"use client";

import type { Asset } from "@foundry/shared-types";
import { MediaPlayer } from "@/components/scenes/media-player";
import { cn } from "@/lib/utils";

interface AssetMediaProps {
  asset: Asset;
  /** Классы медиа-элемента: сайзинг задаёт место, куда его вставили. */
  className?: string;
  /** Плеер с контролами — выключается для миниатюр. */
  controls?: boolean;
}

/**
 * Медиа ассета по его типу. `<img>` годится только для кадров: клип и
 * аудио в нём превращаются в «битую картинку», поэтому у видео и звука
 * свой плеер с контролами в палитре проекта.
 */
export function AssetMedia({
  asset,
  className,
  controls = true,
}: AssetMediaProps) {
  if (!asset.url) return null;

  if (asset.type === "IMAGE") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={asset.url}
        alt={asset.prompt}
        className={cn("h-full w-full object-contain", className)}
      />
    );
  }

  return (
    <MediaPlayer
      src={asset.url}
      kind={asset.type === "VIDEO" ? "video" : "audio"}
      controls={controls}
    />
  );
}
