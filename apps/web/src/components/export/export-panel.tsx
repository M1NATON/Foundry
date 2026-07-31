"use client";

import { useState } from "react";
import { EXPORT_FORMATS, type ExportFormat } from "@foundry/shared-types";
import { api } from "@/lib/api";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ExportPanelProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

interface ExportResult {
  filename: string;
  mime: string;
  content: string;
}

const GROUPS: Array<{
  group: "timeline" | "document";
  label: string;
  note?: string;
}> = [
  {
    group: "timeline",
    label: "Timeline",
    // Путь к медиа в файле абсолютный: монтажка ищет файлы там, где они
    // лежат сейчас. При переносе на другую машину их надо взять с собой.
    note: "Media is referenced by its path on this machine.",
  },
  { group: "document", label: "Document" },
];

/** Экспорт — короткий список форматов, а не отдельная страница. */
export function ExportPanel({ projectId, open, onClose }: ExportPanelProps) {
  const [busy, setBusy] = useState<ExportFormat | null>(null);

  async function download(format: ExportFormat) {
    setBusy(format);
    try {
      const result = await api.post<ExportResult>(
        `/projects/${projectId}/export`,
        { format },
      );

      const blob = new Blob([result.content], { type: result.mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog
      id="export"
      open={open}
      onClose={onClose}
      ariaLabel="Export project"
      className="w-[420px]"
      header={<h2 className="font-display text-lg tracking-tight">Export</h2>}
    >
      <div className="p-2">
        {GROUPS.map(({ group, label, note }) => (
          <div key={group} className="mb-1 last:mb-0">
            <p className="px-3 pb-1 pt-2 text-xs uppercase tracking-tight text-secondary">
              {label}
            </p>
            {note && (
              <p className="px-3 pb-1.5 text-xs text-secondary/80">{note}</p>
            )}
            {EXPORT_FORMATS.filter((spec) => spec.group === group).map(
              (spec) => (
                <button
                  key={spec.format}
                  onClick={() => download(spec.format)}
                  disabled={busy !== null}
                  className={cn(
                    "flex w-full items-baseline gap-3 rounded-md px-3 py-2.5 text-left",
                    "transition-colors hover:bg-bg disabled:opacity-40",
                  )}
                >
                  <span className="w-16 shrink-0 text-sm font-medium">
                    {spec.label}
                  </span>
                  <span className="flex-1 text-xs text-secondary">
                    {spec.hint}
                  </span>
                  <span className="text-xs text-secondary">
                    {busy === spec.format ? "…" : `.${spec.ext}`}
                  </span>
                </button>
              ),
            )}
          </div>
        ))}
      </div>
    </Dialog>
  );
}
