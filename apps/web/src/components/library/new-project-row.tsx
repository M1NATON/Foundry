"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SPRING } from "@/components/ui/primitives";

interface NewProjectRowProps {
  onCreate: (title: string) => void;
  pending: boolean;
}

/**
 * Создание проекта — не модалка. Инлайновая строка прямо в сетке: одно поле,
 * Enter создаёт, Escape отменяет. Меньше кликов до первого действия.
 */
export function NewProjectRow({ onCreate, pending }: NewProjectRowProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setTitle("");
    setOpen(false);
  }

  return (
    <div className="mb-10">
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.div
            key="field"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={SPRING}
            className="flex items-center gap-3 border-b border-primary pb-3"
          >
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") {
                  setTitle("");
                  setOpen(false);
                }
              }}
              placeholder="Working title for the video…"
              className="flex-1 font-display text-xl tracking-tight outline-none placeholder:text-secondary/50"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={submit}
              disabled={!title.trim() || pending}
            >
              {pending ? "Creating…" : "Create"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTitle("");
                setOpen(false);
              }}
            >
              Cancel
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Button variant="secondary" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" strokeWidth={1.75} />
              New project
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
