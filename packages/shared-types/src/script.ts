import { z } from "zod";

/** Средний темп дикторской начитки для YouTube — 150 слов/мин. */
export const WORDS_PER_MINUTE = 150;

export function countWords(content: string): number {
  const trimmed = content.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function estimateSeconds(wordCount: number): number {
  return Math.round((wordCount / WORDS_PER_MINUTE) * 60);
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export const UpsertScriptSchema = z.object({
  content: z.string().default(""),
});
export type UpsertScriptDto = z.infer<typeof UpsertScriptSchema>;

export const ScriptSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  content: z.string(),
  wordCount: z.number(),
  estSeconds: z.number(),
  updatedAt: z.string(),
});
export type Script = z.infer<typeof ScriptSchema>;
