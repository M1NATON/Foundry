"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { X } from "lucide-react";
import { SPRING } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

interface DialogProps {
  /** Ключ, под которым запоминается сдвинутое положение окна. */
  id: string;
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  /** Заголовок; он же ручка для перетаскивания. */
  header: React.ReactNode;
  footer?: React.ReactNode;
  /** Ширина окна: остальную геометрию задаёт сам диалог. */
  className?: string;
  children: React.ReactNode;
}

/**
 * Положение переживает закрытие окна: если человек отодвинул диалог, чтобы
 * видеть за ним таймлайн, при повторном открытии он не должен снова
 * прыгать в центр. В пределах сессии — на диске это хранить незачем.
 */
const positions = new Map<string, { x: number; y: number }>();

/**
 * Модальное окно, которое можно оттащить за заголовок. Диалоги здесь
 * перекрывают именно то, о чём говорят (сцены на таймлайне, ассеты), —
 * приклеенное к центру окно приходилось закрывать, чтобы что-то сверить.
 *
 * Центрирование сделано флексом на обёртке, а не translate-классами:
 * framer-motion пишет сдвиг в тот же transform и затёр бы их.
 */
export function Dialog({
  id,
  open,
  onClose,
  ariaLabel,
  header,
  footer,
  className,
  children,
}: DialogProps) {
  const controls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const start = positions.get(id) ?? { x: 0, y: 0 };

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-primary/10"
          />

          {/* Зона ограничений — видимое окно с отступом: за край экрана
              диалог утащить нельзя. */}
          <div
            ref={constraintsRef}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              role="dialog"
              aria-label={ariaLabel}
              drag
              dragListener={false}
              dragControls={controls}
              dragConstraints={constraintsRef}
              dragMomentum={false}
              dragElastic={0}
              onDragEnd={(_e, info) =>
                positions.set(id, {
                  x: start.x + info.offset.x,
                  y: start.y + info.offset.y,
                })
              }
              initial={{ opacity: 0, x: start.x, y: start.y + 8 }}
              animate={{ opacity: 1, x: start.x, y: start.y }}
              exit={{ opacity: 0, y: start.y + 8 }}
              transition={SPRING}
              className={cn(
                "pointer-events-auto flex max-h-full flex-col overflow-hidden",
                "rounded-xl border border-border bg-surface shadow-subtle",
                className,
              )}
            >
              <div
                onPointerDown={(e) => controls.start(e)}
                className="flex shrink-0 cursor-grab items-start gap-3 border-b border-border
                           px-5 py-4 active:cursor-grabbing"
              >
                <div className="min-w-0 flex-1">{header}</div>
                <button
                  onClick={onClose}
                  // Иначе нажатие на крестик заодно начинает перетаскивание.
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label="Close"
                  className="-mr-1 -mt-1 shrink-0 rounded-sm p-1 text-secondary
                             transition-colors hover:bg-border/40 hover:text-primary"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

              {footer && (
                <div className="shrink-0 border-t border-border">{footer}</div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
