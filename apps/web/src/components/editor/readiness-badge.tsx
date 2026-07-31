"use client";

import type { Scene } from "@foundry/shared-types";
import { SCENE_ASSET_SLOTS, sceneReadiness } from "@foundry/shared-types";
import { cn } from "@/lib/utils";

/**
 * Сколько слотов сцены (кадр/клип/голос/музыка) уже закрыты выбранным
 * готовым ассетом. Видно на таймлайне и в списке — не открывая инспектор.
 */
export function ReadinessBadge({
  scene,
  className,
}: {
  scene: Scene;
  className?: string;
}) {
  const { filled, total } = sceneReadiness(scene);

  return (
    <span
      title={`${filled} of ${total} filled: ${SCENE_ASSET_SLOTS.join(", ").toLowerCase()}`}
      className={cn(
        "shrink-0 rounded-sm px-1 text-xs tabular-nums",
        filled === total
          ? "bg-accent-soft text-accent"
          : "text-secondary",
        className,
      )}
    >
      {filled}/{total}
    </span>
  );
}
