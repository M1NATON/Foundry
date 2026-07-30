"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Пружина из брифа — единственная кривая движения во всём приложении. */
export const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

/** Карточки появляются fade+rise 8px, шаг стаггера 40ms. */
export const RISE = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function staggerDelay(index: number): number {
  return index * 0.04;
}

interface ProgressProps {
  /** 0..1 */
  value: number;
  className?: string;
}

/** Тонкий прогресс-бар с медной заливкой — 2px, без скруглений-таблеток. */
export function Progress({ value, className }: ProgressProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={cn("h-[2px] w-full bg-border overflow-hidden", className)}>
      <motion.div
        className="h-full bg-accent"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={SPRING}
      />
    </div>
  );
}

interface StatusDotProps {
  tone: "idle" | "active" | "done" | "error";
  className?: string;
}

const DOT_TONE: Record<StatusDotProps["tone"], string> = {
  idle: "bg-border",
  active: "bg-accent",
  done: "bg-primary",
  error: "bg-accent",
};

export function StatusDot({ tone, className }: StatusDotProps) {
  return (
    <span className={cn("relative flex h-1.5 w-1.5", className)}>
      {tone === "active" && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
      )}
      <span
        className={cn(
          "relative inline-flex h-1.5 w-1.5 rounded-full",
          DOT_TONE[tone],
          tone === "error" && "ring-2 ring-accent-soft",
        )}
      />
    </span>
  );
}
