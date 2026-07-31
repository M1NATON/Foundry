"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

interface AutoGrowTextareaProps
  extends Omit<ComponentPropsWithoutRef<"textarea">, "rows" | "value"> {
  value: string;
}

/**
 * Textarea, которая растёт по содержимому.
 *
 * Высота берётся не замером в JS, а невидимым двойником в той же ячейке grid:
 * он занимает ровно столько места, сколько занял бы текст, и растягивает
 * ячейку — поле наследует её высоту. Замер приходилось повторять после
 * загрузки шрифта, после смены ширины и после каждой правки, и хвост текста
 * всё равно временами оказывался обрезан; здесь мерить нечего.
 */
export function AutoGrowTextarea({
  value,
  className,
  ...props
}: AutoGrowTextareaProps) {
  return (
    <div className="grid">
      <textarea
        {...props}
        value={value}
        rows={1}
        className={cn(
          "col-start-1 row-start-1 resize-none overflow-hidden",
          className,
        )}
      />
      {/* Двойник обязан совпадать с полем по типографике и правилам переноса,
          иначе высота разойдётся с текстом. Замыкающий пробел держит место
          под последнюю пустую строку. */}
      <div
        aria-hidden
        className={cn(
          "invisible col-start-1 row-start-1 whitespace-pre-wrap break-words",
          className,
        )}
      >
        {value}{" "}
      </div>
    </div>
  );
}
