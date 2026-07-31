"use client";

import {
  BookOpen,
  Clapperboard,
  Download,
  FileText,
  ListChecks,
  ListOrdered,
  Upload,
} from "lucide-react";
import type { EditorStep } from "@/lib/editor-store";
import { useEditor } from "@/lib/editor-store";
import { cn } from "@/lib/utils";

interface PipelineStepperProps {
  onImport: () => void;
  onExport: () => void;
  onReadiness: () => void;
  /** Сколько пробелов осталось до экспорта — бейдж на кнопке. */
  gapCount: number;
}

/**
 * Степпер пайплайна: Research — источники и заметки, Script — сплошной текст
 * начитки, Storyboard — состав и порядок сцен, Producing — канвас с таймлайном
 * и инспектором сцены. Frames/Clip/Voice/Music убраны отсюда — те же действия
 * уже доступны в InspectorPanel при выбранной сцене.
 */
const STEPS = [
  { key: "research", label: "Research", icon: BookOpen },
  { key: "script", label: "Script", icon: FileText },
  { key: "storyboard", label: "Storyboard", icon: ListOrdered },
  { key: "producing", label: "Producing", icon: Clapperboard },
] as const satisfies ReadonlyArray<{
  key: EditorStep;
  label: string;
  icon: typeof FileText;
}>;

/**
 * Стоит статично по центру шапки. Раньше панель плавала над холстом и
 * таскалась мышью — она закрывала превью и её положение приходилось
 * подбирать заново на каждом этапе.
 */
export function PipelineStepper({
  onImport,
  onExport,
  onReadiness,
  gapCount,
}: PipelineStepperProps) {
  const { step, setStep } = useEditor();

  return (
    <div
      className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-bg p-1"
      role="toolbar"
      aria-label="Pipeline steps"
    >
      {STEPS.map(({ key, label, icon: Icon }, index) => {
        const isActive = step === key;
        return (
          <div key={key} className="flex items-center gap-1">
            {index > 0 && (
              <span className="px-0.5 text-secondary/50" aria-hidden>
                &rarr;
              </span>
            )}
            <button
              onClick={() => setStep(key)}
              aria-pressed={isActive}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "flex h-8 items-center gap-2 rounded-md px-3 text-sm transition-colors",
                isActive
                  ? "bg-accent-soft text-accent"
                  : "text-secondary hover:bg-border/40 hover:text-primary",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              <span>{label}</span>
            </button>
          </div>
        );
      })}

      {/* Разделитель обязателен: без него Import/Export читаются
          как ещё один шаг пайплайна. */}
      <span className="mx-1 h-4 w-px bg-border" aria-hidden />

      <button
        onClick={onReadiness}
        aria-label="Readiness check"
        title={
          gapCount > 0
            ? `${gapCount} things to fix before export`
            : "Everything is ready to export"
        }
        className="flex h-8 items-center gap-1.5 rounded-md px-2 text-secondary
                   transition-colors hover:bg-border/40 hover:text-primary"
      >
        <ListChecks className="h-4 w-4" strokeWidth={1.75} />
        {gapCount > 0 && (
          <span className="text-xs tabular-nums text-accent">{gapCount}</span>
        )}
      </button>
      <button
        onClick={onImport}
        aria-label="Import storyboard"
        title="Import storyboard"
        className="flex h-8 w-8 items-center justify-center rounded-md text-secondary
                   transition-colors hover:bg-border/40 hover:text-primary"
      >
        <Upload className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <button
        onClick={onExport}
        aria-label="Export project"
        title="Export project"
        className="flex h-8 w-8 items-center justify-center rounded-md text-secondary
                   transition-colors hover:bg-border/40 hover:text-primary"
      >
        <Download className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}
