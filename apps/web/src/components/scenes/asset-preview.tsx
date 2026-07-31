"use client";

import { motion } from "framer-motion";
import { Check, Mic, Music, Trash2 } from "lucide-react";
import type { Asset } from "@foundry/shared-types";
import { assetDurationDrift, isAssetPending } from "@foundry/shared-types";
import { AssetMedia } from "@/components/scenes/asset-media";
import { SPRING, StatusDot } from "@/components/ui/primitives";
import {
  useAssetPolling,
  useDeleteAsset,
  useSetActiveAsset,
} from "@/lib/queries/scenes";
import { cn } from "@/lib/utils";

interface AssetPreviewProps {
  asset: Asset;
  projectId: string;
  sceneId: string;
  isActive: boolean;
  /** Длительность сцены, с которой сверяется длина файла. */
  sceneDurationSec: number;
}

/**
 * Ассет показывается как крупный кадр 16:9 — никаких имён файлов и иконок
 * документов. Пока идёт генерация, на месте кадра «дышит» штрихованный слот.
 * Активный вариант (тот, что показан в canvas/на таймлайне) отмечен рамкой
 * и галочкой; клик по карточке делает её активной.
 */
export function AssetPreview({
  asset,
  projectId,
  sceneId,
  isActive,
  sceneDurationSec,
}: AssetPreviewProps) {
  const pending = isAssetPending(asset.status);
  const { data: polled } = useAssetPolling(projectId, asset.id, pending);
  const deleteAsset = useDeleteAsset(projectId);
  const setActiveAsset = useSetActiveAsset(projectId);

  const current = polled ?? asset;
  const isPending = isAssetPending(current.status);
  const failed = current.status === "FAILED";
  const selectable = current.status === "READY" && !isActive;
  const isAudio = current.type === "VOICE" || current.type === "MUSIC";
  const AudioIcon = current.type === "MUSIC" ? Music : Mic;
  const drift = assetDurationDrift(current, sceneDurationSec);

  return (
    <motion.figure
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      onClick={() =>
        selectable &&
        setActiveAsset.mutate({
          sceneId,
          dto: { type: current.type, assetId: current.id },
        })
      }
      className={cn(
        "group/asset relative overflow-hidden rounded-lg border-2 bg-bg transition-colors",
        isActive ? "border-accent" : "border-border",
        selectable && "cursor-pointer hover:border-secondary/40",
      )}
    >
      <div
        className={cn(
          "relative",
          // Звуку кадр 16:9 не нужен — он занимает одну строку.
          isAudio ? "flex items-center gap-2.5 px-3 py-2.5" : "aspect-video",
        )}
      >
        {isAudio && (
          <AudioIcon className="h-4 w-4 shrink-0 text-secondary" strokeWidth={1.75} />
        )}

        {current.url && !isPending ? (
          // Клик по плееру не должен заодно менять активный ассет — для
          // этого в подписи есть отдельная кнопка «Use».
          <div
            className={cn(isAudio ? "min-w-0 flex-1" : "h-full w-full")}
            onClick={(e) => current.type !== "IMAGE" && e.stopPropagation()}
          >
            <AssetMedia asset={current} />
          </div>
        ) : isAudio ? (
          <span className="flex-1 text-xs text-secondary">
            {isPending ? "Generating…" : "No file"}
          </span>
        ) : (
          <div className="relative h-full w-full">
            <div
              className={cn(
                "hatch absolute inset-0 opacity-40",
                isPending && "animate-pulse",
              )}
            />
          </div>
        )}

        {isActive && !isAudio && (
          <div className="absolute right-2 top-2 rounded-full bg-accent p-1">
            <Check className="h-3 w-3 text-bg" strokeWidth={2} />
          </div>
        )}

        {drift !== null && !isAudio && <DriftBadge drift={drift} floating />}
      </div>

      <figcaption className="flex items-center gap-2 border-t border-border bg-surface px-3 py-2">
        <StatusDot
          tone={
            failed
              ? "error"
              : isPending
                ? "active"
                : current.status === "READY"
                  ? "done"
                  : "idle"
          }
        />
        {isActive && isAudio && (
          <Check className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
        )}
        {drift !== null && isAudio && <DriftBadge drift={drift} />}
        <span className="text-xs text-secondary">
          {failed
            ? (current.errorMsg ?? "Failed")
            : isPending
              ? current.status === "QUEUED"
                ? "Queued"
                : "Generating…"
              : current.type.toLowerCase()}
        </span>

        {selectable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveAsset.mutate({
                sceneId,
                dto: { type: current.type, assetId: current.id },
              });
            }}
            className="ml-auto text-xs text-secondary transition-colors hover:text-primary"
          >
            Use
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteAsset.mutate(current.id);
          }}
          className={cn(
            "text-secondary opacity-0 transition-opacity",
            "hover:text-accent group-hover/asset:opacity-100",
            !selectable && "ml-auto",
          )}
          aria-label="Delete asset"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </figcaption>
    </motion.figure>
  );
}

/**
 * Насколько файл не совпал по длине со сценой. Foundry ничего не подрезает
 * и не перегенерирует — синхронизация всё равно руками в монтаже, поэтому
 * задача бейджа только одна: не дать расхождению доехать до сборки незамеченным.
 */
function DriftBadge({
  drift,
  floating,
}: {
  drift: number;
  floating?: boolean;
}) {
  const label = `${drift > 0 ? "+" : "−"}${Math.abs(drift).toFixed(1)}s ${
    drift > 0 ? "longer" : "shorter"
  }`;

  return (
    <span
      title={`This file is ${label.toLowerCase()} than the scene`}
      className={cn(
        "rounded-sm bg-accent-soft px-1.5 py-0.5 text-xs tabular-nums text-accent",
        floating && "absolute left-2 top-2 backdrop-blur-[2px]",
      )}
    >
      {label}
    </span>
  );
}
