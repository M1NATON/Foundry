"use client";

import Link from "next/link";
import { ArrowLeft, Download, Moon, Sun } from "lucide-react";
import { PROJECT_STATUS_LABEL } from "@foundry/shared-types";
import type { ProjectStatus } from "@foundry/shared-types";
import { useEditor } from "@/lib/editor-store";
import { cn } from "@/lib/utils";

interface EditorChromeProps {
  title: string;
  status: ProjectStatus;
  onExport: () => void;
}

export function EditorChrome({ title, status, onExport }: EditorChromeProps) {
  const { theme, setTheme } = useEditor();
  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b border-border bg-surface px-4">
      <Link
        href="/"
        aria-label="Back to library"
        className="flex items-center gap-1.5 text-xs text-secondary transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span className="hidden sm:inline">Library</span>
      </Link>

      <span className="h-4 w-px bg-border" aria-hidden />

      <h1 className="min-w-0 flex-1 truncate font-display text-sm tracking-tight">
        {title}
      </h1>

      <span className="text-xs text-secondary">
        {PROJECT_STATUS_LABEL[status]}
      </span>

      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-sm border border-border bg-surface",
          "text-secondary transition-colors hover:border-secondary/40 hover:text-primary",
        )}
      >
        {theme === "dark" ? (
          <Sun className="h-3.5 w-3.5" strokeWidth={1.75} />
        ) : (
          <Moon className="h-3.5 w-3.5" strokeWidth={1.75} />
        )}
      </button>

      <button
        onClick={onExport}
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-sm border border-border bg-surface px-2.5",
          "text-xs text-secondary transition-colors hover:border-secondary/40 hover:text-primary",
        )}
      >
        <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
        Export
      </button>
    </header>
  );
}
