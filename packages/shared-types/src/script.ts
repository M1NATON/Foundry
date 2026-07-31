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

/**
 * Диктор останавливается на знаках препинания, и на короткой реплике эти
 * паузы весят больше самих слов: «Стой. Смотри.» звучит заметно дольше двух
 * слов подряд. Поэтому оценка по тексту считает и слова, и паузы.
 */
export const SENTENCE_PAUSE_SECONDS = 0.45;
export const CLAUSE_PAUSE_SECONDS = 0.2;

/**
 * Отдельно стоящее тире `countWords` считает словом — для счётчика слов это
 * не важно, а для длительности важно: иначе оно даст и слово, и паузу.
 */
function countSpokenWords(text: string): number {
  return text
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

/** Многоточие и «?!» — одна пауза, а не две-три: знаки идут подряд. */
const SENTENCE_END = /[.!?…]+/g;
/** Дефис внутри слова паузой не является — тире считаем только отдельным словом. */
const CLAUSE_BREAK = /[,;:]|(?:^|\s)[—–-](?=\s|$)/g;

/**
 * Оценка длительности начитки по тексту. Возвращает дробные секунды: на сцене
 * в несколько слов округление до целой съедает существенную долю длины.
 */
export function estimateSpeechSeconds(text: string): number {
  const words = countSpokenWords(text);
  if (words === 0) return 0;

  const spoken = (words / WORDS_PER_MINUTE) * 60;
  const sentences = text.match(SENTENCE_END)?.length ?? 0;
  const clauses = text.match(CLAUSE_BREAK)?.length ?? 0;

  const total =
    spoken +
    sentences * SENTENCE_PAUSE_SECONDS +
    clauses * CLAUSE_PAUSE_SECONDS;

  // Десятых достаточно: дальше это уже ложная точность.
  return Math.round(total * 10) / 10;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Длительность одной сцены. До минуты показываем десятую долю — там она
 * заметная часть длины; дальше она только шумит, и формат совпадает с общим.
 */
export function formatSceneDuration(totalSeconds: number): string {
  const s = Math.round(Math.max(0, totalSeconds) * 10) / 10;
  if (s >= 60) return formatDuration(s);
  return `0:${s.toFixed(1).padStart(4, "0")}`;
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
