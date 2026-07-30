"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RISE, SPRING } from "@/components/ui/primitives";

interface EmptyLibraryProps {
  onCreate: () => void;
  pending: boolean;
}

/**
 * Пустое состояние — не иллюстрация-заглушка, а «пустой стапель»: три
 * штрихованных слота показывают, во что превратится библиотека.
 */
export function EmptyLibrary({ onCreate, pending }: EmptyLibraryProps) {
  return (
    <motion.div
      initial={RISE.initial}
      animate={RISE.animate}
      transition={SPRING}
      className="mt-4"
    >
      <div className="grid grid-cols-3 gap-6" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="relative aspect-video overflow-hidden rounded-xl border border-dashed border-border"
            style={{ opacity: 1 - i * 0.28 }}
          >
            <div className="hatch absolute inset-0 opacity-40" />
          </div>
        ))}
      </div>

      <div className="mt-12 max-w-reading">
        <h2 className="font-display text-2xl leading-tight tracking-tight">
          Nothing in the foundry yet.
        </h2>
        <p className="mt-3 text-base text-secondary">
          A project carries one video from first source to final export —
          research, script, storyboard, scenes, assets. Start one and the
          pipeline fills in as you work.
        </p>
        <Button
          variant="primary"
          className="mt-7"
          onClick={onCreate}
          disabled={pending}
        >
          {pending ? "Creating…" : "Start a project"}
        </Button>
      </div>
    </motion.div>
  );
}
