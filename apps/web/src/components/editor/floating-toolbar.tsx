"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clapperboard, FileText, GripHorizontal } from "lucide-react";
import { SPRING } from "@/components/ui/primitives";
import type { EditorTool } from "@/lib/editor-store";
import { cn } from "@/lib/utils";

interface FloatingToolbarProps {
  active: EditorTool;
  onSelect: (tool: Exclude<EditorTool, null>) => void;
  projectId: string;
  sceneCount: number;
}

/**
 * Степпер пайплайна: Script — шаг ДО разбиения на сцены (полноэкранный
 * редактор начитки), Storyboard — канвас + таймлайн + инспектор сцены.
 * Frames/Clip/Voice/Music убраны отсюда — те же действия уже доступны
 * в InspectorPanel при выбранной сцене, дублировать их здесь незачем.
 */
const TOOLS = [
  { key: "script", label: "Script", icon: FileText },
  { key: "storyboard", label: "Storyboard", icon: Clapperboard },
] as const;

/**
 * Плавающая панель инструментов. Перетаскивается за ручку (GripHorizontal)
 * и запоминает позицию в пределах сессии — пользователь ставит её, где удобно.
 */
export function FloatingToolbar({ active, onSelect }: FloatingToolbarProps) {
  // Любой инструмент, кроме script (в т.ч. null, storyboard, frames, clip,
  // voice, music), относится к этапу Storyboard — script открывает
  // полноэкранный редактор поверх всего этого.
  const step: "script" | "storyboard" = active === "script" ? "script" : "storyboard";
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <>
      {/* Полная зона ограничений: холст + таймлайн, без перекрытия панелей. */}
      <div
        ref={constraintsRef}
        className="pointer-events-none absolute inset-0 z-30"
        aria-hidden
      />
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0}
        onDragEnd={(_e, info) =>
          setPosition({ x: position.x + info.offset.x, y: position.y + info.offset.y })
        }
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, x: position.x }}
        style={{ y: position.y }}
        transition={SPRING}
        className="absolute bottom-[200px] left-1/2 z-30 flex -translate-x-1/2 items-center gap-1
                   rounded-xl border border-border bg-surface p-1.5 shadow-subtle"
        role="toolbar"
        aria-label="Editor tools"
      >
        <span
          className="cursor-grab px-1 text-secondary/60 active:cursor-grabbing"
          aria-label="Drag toolbar"
        >
          <GripHorizontal className="h-4 w-4" strokeWidth={1.75} />
        </span>
        {TOOLS.map(({ key, label, icon: Icon }, index) => {
          const isActive = step === key;
          return (
            <div key={key} className="flex items-center gap-1">
              {index > 0 && (
                <span className="px-1 text-secondary/50" aria-hidden>
                  &rarr;
                </span>
              )}
              <button
                onClick={() => onSelect(key)}
                aria-pressed={isActive}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-lg px-3.5 text-sm transition-colors",
                  isActive
                    ? "bg-accent-soft text-accent"
                    : "text-secondary hover:bg-border/40 hover:text-primary",
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full border",
                    isActive
                      ? "border-accent bg-accent"
                      : "border-secondary/50 bg-transparent",
                  )}
                  aria-hidden
                />
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span>{label}</span>
              </button>
            </div>
          );
        })}
      </motion.div>
    </>
  );
}
