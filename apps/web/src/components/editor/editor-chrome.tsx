"use client";

import Link from "next/link";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { PROJECT_STATUS_LABEL } from "@foundry/shared-types";
import type { ProjectStatus } from "@foundry/shared-types";
import { PipelineStepper } from "@/components/editor/pipeline-stepper";
import { useEditor } from "@/lib/editor-store";
import { cn } from "@/lib/utils";

interface EditorChromeProps {
  title: string;
  status: ProjectStatus;
  onImport: () => void;
  onExport: () => void;
  onReadiness: () => void;
  gapCount: number;
}

export function EditorChrome({
  title,
  status,
  onImport,
  onExport,
  onReadiness,
  gapCount,
}: EditorChromeProps) {
  const { theme, setTheme } = useEditor();
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-surface px-4">
      {/* Боковые группы одинаково растяжимы — степпер стоит ровно по центру
          окна, а не по остатку места после заголовка. */}
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Link
          href="/"
          aria-label="Back to library"
          className="flex shrink-0 items-center gap-1.5 text-xs text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="hidden sm:inline">Library</span>
        </Link>

        <span className="h-4 w-px shrink-0 bg-border" aria-hidden />

        <h1 className="min-w-0 truncate font-display text-sm tracking-tight">
          {title}
        </h1>
      </div>

      <PipelineStepper
        onImport={onImport}
        onExport={onExport}
        onReadiness={onReadiness}
        gapCount={gapCount}
      />

      <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
        <span className="truncate text-xs text-secondary">
          {PROJECT_STATUS_LABEL[status]}
        </span>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-border bg-surface",
            "text-secondary transition-colors hover:border-secondary/40 hover:text-primary",
          )}
        >
          {theme === "dark" ? (
            <Sun className="h-3.5 w-3.5" strokeWidth={1.75} />
          ) : (
            <Moon className="h-3.5 w-3.5" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </header>
  );
}
