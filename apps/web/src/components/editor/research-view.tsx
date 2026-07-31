"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ExternalLink, Plus, Trash2 } from "lucide-react";
import type { Source } from "@foundry/shared-types";
import { Button } from "@/components/ui/button";
import { useEditor } from "@/lib/editor-store";
import { useResearch, useSaveResearch } from "@/lib/queries/research";

interface ResearchViewProps {
  projectId: string;
}

const AUTOSAVE_MS = 1200;

/**
 * key существует только для React: у источника нет id (sources лежат
 * одним JSON-полем), а по индексу строка теряет фокус после удаления соседа.
 */
interface SourceRow extends Source {
  key: string;
}

let keySeq = 0;
function nextKey() {
  keySeq += 1;
  return `src-${keySeq}`;
}

function toRows(sources: Source[]): SourceRow[] {
  return sources.map((source) => ({ ...source, key: nextKey() }));
}

/**
 * Полноэкранный вид первого этапа: источники и свободные заметки.
 * Как и остальные этапы, это не оверлей — пока он смонтирован, канваса
 * и скрипта в DOM нет. Данные живут в кеше React Query (useResearch),
 * поэтому уход на другой этап и обратно ничего не теряет.
 */
export function ResearchView({ projectId }: ResearchViewProps) {
  const { data: research } = useResearch(projectId);
  const saveResearch = useSaveResearch(projectId);
  const { setStep } = useEditor();

  const [rows, setRows] = useState<SourceRow[]>(() =>
    toRows(research?.sources ?? []),
  );
  const [notes, setNotes] = useState(research?.notes ?? "");
  const [dirty, setDirty] = useState(false);
  const loadedFor = useRef<string | null>(research ? projectId : null);

  useEffect(() => {
    if (research && loadedFor.current !== projectId) {
      setRows(toRows(research.sources));
      setNotes(research.notes ?? "");
      loadedFor.current = projectId;
    }
  }, [research, projectId]);

  // Источник без заголовка не проходит SourceSchema (title min 1), поэтому
  // черновые строки остаются в UI, но на сервер не уходят.
  const payload = () => ({
    sources: rows
      .filter((row) => row.title.trim())
      .map(({ key: _key, ...source }) => source),
    notes,
  });
  const pending = useRef({ payload, dirty });
  pending.current = { payload, dirty };

  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      saveResearch.mutate(pending.current.payload());
      setDirty(false);
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [rows, notes, dirty, saveResearch]);

  // Последняя правка не должна уехать вместе с размонтированием вида:
  // при уходе со степа дописываем её сразу.
  useEffect(() => {
    const save = saveResearch.mutate;
    return () => {
      if (pending.current.dirty) save(pending.current.payload());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function patchRow(key: string, patch: Partial<Source>) {
    setRows((old) =>
      old.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
    setDirty(true);
  }

  function addRow() {
    setRows((old) => [
      ...old,
      { key: nextKey(), title: "", url: "", note: "" },
    ]);
    setDirty(true);
  }

  function removeRow(key: string) {
    setRows((old) => old.filter((row) => row.key !== key));
    setDirty(true);
  }

  const untitled = rows.some((row) => !row.title.trim());

  return (
    <section
      className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-bg"
      aria-label="Research"
    >
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-8 py-10">
        <div className="mb-6 flex shrink-0 items-baseline justify-between">
          <h1 className="font-display text-2xl tracking-tight">Research</h1>
          <div className="flex items-center gap-4 text-xs tabular-nums text-secondary">
            <span>
              {rows.length} source{rows.length === 1 ? "" : "s"}
            </span>
            <span>{dirty || saveResearch.isPending ? "Saving…" : "Saved"}</span>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm text-secondary">
              No sources yet — add the links and papers this video is built on.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => (
              <SourceRowItem
                key={row.key}
                row={row}
                onChange={(patch) => patchRow(row.key, patch)}
                onRemove={() => removeRow(row.key)}
              />
            ))}
          </ul>
        )}

        <div className="mt-4 flex shrink-0 flex-wrap items-center gap-3">
          <Button size="sm" variant="ghost" onClick={addRow}>
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Add source
          </Button>
          {untitled && (
            <span className="text-xs text-secondary">
              Sources need a title to be saved.
            </span>
          )}
          {saveResearch.isError && (
            <span className="text-xs text-accent">
              Could not save the research — it will retry on the next edit.
            </span>
          )}
        </div>

        <label className="mt-8 flex min-h-0 flex-1 flex-col">
          <span className="mb-1.5 block text-xs uppercase tracking-tight text-secondary">
            Notes
          </span>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setDirty(true);
            }}
            placeholder="Facts, numbers, quotes, angles — everything the script should lean on."
            spellCheck={false}
            className="min-h-[30vh] w-full flex-1 resize-none rounded-md border border-border
                       bg-transparent px-3 py-2 text-sm leading-relaxed outline-none
                       transition-colors focus:border-secondary/40
                       placeholder:text-secondary/60"
          />
        </label>

        <div className="mt-6 flex shrink-0 justify-end">
          <Button variant="primary" onClick={() => setStep("script")}>
            Write the script
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </section>
  );
}

interface SourceRowItemProps {
  row: SourceRow;
  onChange: (patch: Partial<Source>) => void;
  onRemove: () => void;
}

function SourceRowItem({ row, onChange, onRemove }: SourceRowItemProps) {
  const href = row.url.trim();

  return (
    <li className="group rounded-md border border-border bg-surface px-3 py-2.5">
      <div className="flex items-center gap-3">
        <input
          value={row.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Title"
          aria-label="Source title"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none
                     placeholder:text-secondary/60"
        />
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${row.title || href}`}
            className="shrink-0 text-secondary transition-colors hover:text-accent"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
          </a>
        )}
        <button
          onClick={onRemove}
          aria-label={`Delete ${row.title || "source"}`}
          className="shrink-0 rounded-sm p-1 text-secondary opacity-0 transition-all
                     hover:bg-border/40 hover:text-error group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>

      <input
        value={row.url}
        onChange={(e) => onChange({ url: e.target.value })}
        placeholder="https://…"
        aria-label="Source URL"
        spellCheck={false}
        className="mt-1 w-full bg-transparent text-xs text-secondary outline-none
                   placeholder:text-secondary/50"
      />

      <textarea
        value={row.note}
        onChange={(e) => onChange({ note: e.target.value })}
        placeholder="Why this source matters…"
        rows={2}
        className="mt-1.5 w-full resize-none bg-transparent text-xs leading-relaxed
                   outline-none placeholder:text-secondary/50"
      />
    </li>
  );
}
