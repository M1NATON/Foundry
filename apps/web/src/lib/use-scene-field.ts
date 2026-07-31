"use client";

import { useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Scene, UpdateSceneDto } from "@foundry/shared-types";
import { api } from "@/lib/api";
import { sceneKeys } from "@/lib/queries/scenes";

/** Текстовые поля сцены, которые редактируются живым вводом. */
export type SceneTextField = "voiceText" | "imagePrompt" | "videoPrompt";

const DEBOUNCE_MS = 400;
/** Правки внутри одного «залпа» набора складываются в один шаг undo. */
const UNDO_COALESCE_MS = 700;
const UNDO_DEPTH = 50;

interface PendingWrite {
  timer: ReturnType<typeof setTimeout>;
  flush: () => void;
}

/**
 * Отложенные PATCH и история undo живут на уровне модуля, а не инстанса
 * хука: одно и то же поле редактируется из нескольких мест (канвас и
 * инспектор), и у них должны быть общий debounce и общий Ctrl+Z — иначе
 * два таймера отправят на сервер разные версии текста.
 */
const pendingWrites = new Map<string, PendingWrite>();
const undoStacks = new Map<string, string[]>();
const lastUndoPushAt = new Map<string, number>();

function keyOf(sceneId: string, field: SceneTextField): string {
  return `${sceneId}:${field}`;
}

/**
 * Одно текстовое поле сцены. Значение читается из кеша списка сцен —
 * единственного источника правды, поэтому правка на канвасе видна в
 * инспекторе сразу, без ожидания ответа сервера.
 */
export function useSceneField(
  projectId: string,
  scene: Scene | null,
  field: SceneTextField,
) {
  const qc = useQueryClient();

  const patch = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSceneDto }) =>
      api.patch<Scene>(`/scenes/${id}`, dto),
    onSuccess: (updated, variables) => {
      const [patched, submitted] = Object.entries(variables.dto)[0] ?? [];
      qc.setQueryData<Scene[]>(sceneKeys.list(projectId), (old) =>
        old?.map((s) => {
          if (s.id !== updated.id) return s;
          // Поздний ответ не должен затереть текст, который пользователь
          // уже продолжил набирать после отправки этого PATCH.
          if (patched && s[patched as keyof Scene] !== submitted) return s;
          return updated;
        }),
      );
    },
    onError: () => {
      void qc.invalidateQueries({ queryKey: sceneKeys.list(projectId) });
    },
  });

  const write = useCallback(
    (sceneId: string, next: string) => {
      qc.setQueryData<Scene[]>(sceneKeys.list(projectId), (old) =>
        old?.map((s) => (s.id === sceneId ? { ...s, [field]: next } : s)),
      );

      const key = keyOf(sceneId, field);
      const existing = pendingWrites.get(key);
      if (existing) clearTimeout(existing.timer);

      const send = () => {
        pendingWrites.delete(key);
        patch.mutate({ id: sceneId, dto: { [field]: next } });
      };
      pendingWrites.set(key, {
        timer: setTimeout(send, DEBOUNCE_MS),
        flush: send,
      });
    },
    [qc, projectId, field, patch],
  );

  // Несохранённая правка не должна уехать вместе с размонтированием вида:
  // на выходе её дописывают сразу, а не отменяют таймер.
  useEffect(() => {
    return () => {
      for (const [key, pending] of pendingWrites) {
        if (!key.endsWith(`:${field}`)) continue;
        clearTimeout(pending.timer);
        pending.flush();
      }
    };
  }, [field]);

  const sceneId = scene?.id ?? null;
  const value = scene ? ((scene[field] as string | null) ?? "") : "";

  const onChange = useCallback(
    (next: string) => {
      if (!sceneId) return;
      const key = keyOf(sceneId, field);
      const now = Date.now();
      if ((lastUndoPushAt.get(key) ?? 0) + UNDO_COALESCE_MS < now) {
        const stack = undoStacks.get(key) ?? [];
        stack.push(value);
        if (stack.length > UNDO_DEPTH) stack.shift();
        undoStacks.set(key, stack);
        lastUndoPushAt.set(key, now);
      }
      write(sceneId, next);
    },
    [sceneId, field, value, write],
  );

  /** Ctrl+Z: у контролируемой textarea нет нативной истории браузера. */
  const undo = useCallback(() => {
    if (!sceneId) return false;
    const key = keyOf(sceneId, field);
    const previous = undoStacks.get(key)?.pop();
    if (previous === undefined) return false;
    lastUndoPushAt.delete(key);
    write(sceneId, previous);
    return true;
  }, [sceneId, field, write]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "z" || e.shiftKey) return;
      if (!e.ctrlKey && !e.metaKey) return;
      if (undo()) e.preventDefault();
    },
    [undo],
  );

  /** Пропсы для textarea/input: значение, ввод и Ctrl+Z. */
  const fieldProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
      onChange(e.target.value),
    onKeyDown,
  };

  return { value, onChange, onKeyDown, undo, fieldProps };
}
