"use client";

import { useRef, useState } from "react";
import type { Scene } from "@foundry/shared-types";

export interface ReorderItem {
  sceneId: string;
  newOrder: number;
}

/**
 * Складывает два набора drag-пропсов в один.
 *
 * Разложенные подряд через spread, они молча затирают одноимённые
 * обработчики — второй набор побеждает, и первый перестаёт работать без
 * единой ошибки. Так на карточке сцены пропала перестановка, когда рядом
 * повесили приём файлов: оба слушают dragenter и dragover.
 */
export function mergeHandlers<
  A extends Record<string, unknown>,
  B extends Record<string, unknown>,
>(a: A, b: B): A & B {
  const merged: Record<string, unknown> = { ...a };

  for (const [key, next] of Object.entries(b)) {
    const previous = merged[key];
    merged[key] =
      typeof previous === "function" && typeof next === "function"
        ? (...args: unknown[]) => {
            (previous as (...rest: unknown[]) => void)(...args);
            (next as (...rest: unknown[]) => void)(...args);
          }
        : next;
  }

  return merged as A & B;
}

/**
 * Перетаскивание сцен, общее для таймлайна и списка раскадровки.
 * Пока тащим — порядок держится локально, иначе карточка «прыгает» между
 * позицией курсора и ответом сервера. На drop уходит только реально
 * изменившийся кусок порядка.
 */
export function useDragReorder(
  scenes: Scene[],
  onCommit: (items: ReorderItem[]) => void,
) {
  const [dragOrder, setDragOrder] = useState<string[] | null>(null);
  const dragId = useRef<string | null>(null);

  const ordered =
    dragOrder != null
      ? [...scenes].sort(
          (a, b) => dragOrder.indexOf(a.id) - dragOrder.indexOf(b.id),
        )
      : scenes;

  function start(id: string) {
    dragId.current = id;
    setDragOrder(ordered.map((s) => s.id));
  }

  function enter(targetId: string) {
    const from = dragId.current;
    if (!from || from === targetId) return;
    setDragOrder((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const a = next.indexOf(from);
      const b = next.indexOf(targetId);
      next.splice(a, 1);
      next.splice(b, 0, from);
      return next;
    });
  }

  function end() {
    const finalOrder = dragOrder;
    dragId.current = null;
    setDragOrder(null);
    if (!finalOrder) return;

    const changed = finalOrder
      .map((id, idx) => ({ sceneId: id, newOrder: idx }))
      .filter(({ sceneId, newOrder }) => {
        const scene = scenes.find((s) => s.id === sceneId);
        return scene !== undefined && scene.order !== newOrder;
      });
    if (changed.length > 0) onCommit(changed);
  }

  /** Пропсы для перетаскиваемого элемента — без аргументов, чтобы их
   *  принимал и motion.div с его собственной сигнатурой onDragStart. */
  function dragProps(id: string) {
    return {
      draggable: true,
      onDragStart: () => start(id),
      onDragEnter: () => enter(id),
      onDragEnd: () => end(),
      onDragOver: (e: React.DragEvent) => e.preventDefault(),
    };
  }

  return { ordered, draggingId: dragId.current, dragProps };
}
