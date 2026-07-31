"use client";

import { useEffect, type RefObject } from "react";

/**
 * Высота textarea по содержимому.
 *
 * Пересчёта на изменение текста мало: display-шрифт грузится асинхронно, и
 * первый замер успевает пройти на подменном шрифте — с настоящим текст в
 * посчитанную высоту уже не влезает, а пересчитать её нечему. Отсюда и
 * обрезанный хвост, который «чинился» первым же нажатием клавиши.
 *
 * Поэтому меряем ещё дважды: когда шрифты готовы и когда меняется ширина
 * поля (панель ушла в другой размер — перенос строк стал другим).
 */
export function useAutoResize(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };

    fit();

    // Следим только за шириной: реагировать на высоту нельзя — её меняет сам
    // fit(), и наблюдатель гонял бы себя по кругу.
    let lastWidth = el.clientWidth;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width === lastWidth) return;
      lastWidth = width;
      fit();
    });
    observer.observe(el);

    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) fit();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [ref, value]);
}
