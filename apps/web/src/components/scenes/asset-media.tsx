"use client";

import type { Asset } from "@foundry/shared-types";
import { cn } from "@/lib/utils";

interface AssetMediaProps {
  asset: Asset;
  /** Классы медиа-элемента: обычно object-cover или object-contain. */
  className?: string;
  /** Плеер с контролами — выключается для миниатюр. */
  controls?: boolean;
}

/**
 * Медиа ассета по его типу. `<img>` годится только для кадров: клип и
 * аудио в нём превращаются в «битую картинку», поэтому у видео свой
 * `<video>`, а у голоса и музыки — `<audio>` поверх штрихованного слота.
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
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  if (asset.type === "VIDEO") {
    return (
      <video
        src={asset.url}
        controls={controls}
        playsInline
        muted={!controls}
        // metadata хватает на первый кадр — целиком клип не тянем.
        preload="metadata"
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-3">
      <audio src={asset.url} controls={controls} preload="metadata" className="w-full" />
    </div>
  );
}
