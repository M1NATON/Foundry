import { z } from "zod";
import { WORDS_PER_MINUTE, countWords, estimateSeconds } from "./script";

/**
 * Импорт раскадровки, собранной во внешнем чате (ChatGPT/Claude/Gemini).
 * Пользователь копирует промпт, вставляет ответ модели — приложение
 * не ходит в LLM само, поэтому работает без единого API-ключа.
 */

/** Темп начитки берётся из той же константы, что и счётчик в редакторе скрипта. */
export const WORDS_PER_SECOND = WORDS_PER_MINUTE / 60;

/** Ниже трёх секунд сцена не успевает прочитаться зрителем. */
export const MIN_SCENE_SECONDS = 3;

/** Пустую строку и null приводим к "" — поле опциональное по смыслу. */
const optionalText = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => value?.trim() ?? "");

/**
 * Строгие только `title` и `voiceText`: это то, что нельзя восстановить.
 * Промпты и длительность модель периодически теряет — дешевле дозаполнить,
 * чем отклонить всю вставку и заставить человека гонять генерацию заново.
 */
export const StoryboardSceneSchema = z.object({
  order: z.number().int().positive().optional(),
  title: z.string().trim().min(1).max(200),
  voiceText: z.string().trim().min(1),
  imagePrompt: optionalText,
  videoPrompt: optionalText,
  durationSec: z.number().int().positive().optional(),
});
export type StoryboardScene = z.infer<typeof StoryboardSceneSchema>;

const StoryboardObjectSchema = z.object({
  projectTitle: z.string().trim().min(1).max(200).optional(),
  totalDurationSec: z.number().int().nonnegative().optional(),
  scenes: z.array(StoryboardSceneSchema).min(1),
});

/**
 * Часть моделей игнорирует обёртку и отдаёт голый массив сцен — оборачиваем его
 * до валидации. Именно preprocess, а не union: union схлопывает ошибки веток в
 * бесполезное «Invalid input», а человеку нужно видеть, в какой сцене чего не
 * хватает. `totalDurationSec` с суммой не сверяем — модели ошибаются в
 * арифметике, а сервер всё равно считает длительности сам.
 */
export const StoryboardImportSchema = z.preprocess(
  (value) => (Array.isArray(value) ? { scenes: value } : value),
  StoryboardObjectSchema,
);
export type StoryboardImport = z.infer<typeof StoryboardImportSchema>;

/** Тело эндпоинта: сырой текст из буфера обмена, разбирается на сервере. */
export const ImportStoryboardSchema = z.object({
  raw: z.string().min(1),
});
export type ImportStoryboardDto = z.infer<typeof ImportStoryboardSchema>;

/**
 * Достаёт JSON из ответа модели: снимает markdown-обёртку и отрезает
 * преамбулу вида «Here is your storyboard:» вместе с послесловием.
 */
export function extractJson(text: string): string {
  const trimmed = text.trim();

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : trimmed).trim();

  const start = body.search(/[[{]/);
  if (start === -1) return body;

  const close = body[start] === "{" ? "}" : "]";
  const end = body.lastIndexOf(close);

  return end > start ? body.slice(start, end + 1) : body.slice(start);
}

/** Длительность сцены: из ответа модели, иначе считаем по её же тексту. */
export function sceneSeconds(scene: StoryboardScene): number {
  const fallback = estimateSeconds(countWords(scene.voiceText));
  return Math.max(MIN_SCENE_SECONDS, scene.durationSec ?? fallback);
}

/**
 * Промпт для внешнего чата. Собирается из констант проекта, чтобы оценка
 * длительности здесь и в редакторе скрипта не разъезжались.
 */
export function buildStoryboardPrompt(script: string): string {
  return `You are a professional YouTube video storyboard writer.

TASK
Take the script below and split it into scenes for video production.
Return ONLY valid JSON, no markdown code fences, no commentary before or after.

RULES
- Split narration into natural scene breaks — each scene should be one visual beat / one idea, not more than ~25 seconds of narration.
- voiceText must be an exact, word-for-word segment of the original script — do not paraphrase or summarize it. Every word of the input script must appear in exactly one scene's voiceText, in order.
- imagePrompt: a detailed visual description for AI image generation matching this scene — describe composition, subject, mood, lighting, style. No text/logos in the prompt.
- videoPrompt: same visual as imagePrompt but describe camera motion / subject motion for a short video clip (e.g. slow push-in, pan left, subject turns).
- durationSec: estimate using ~${WORDS_PER_SECOND.toFixed(1)} words per second, rounded to nearest integer, minimum ${MIN_SCENE_SECONDS}.
- order starts at 1 and increments per scene.
- projectTitle: infer a short working title from the script content.
- totalDurationSec: sum of all scene durations.

OUTPUT FORMAT (exact shape, no extra fields, no missing fields):
{
  "projectTitle": "string",
  "totalDurationSec": number,
  "scenes": [
    {
      "order": number,
      "title": "string",
      "voiceText": "string",
      "imagePrompt": "string",
      "videoPrompt": "string",
      "durationSec": number
    }
  ]
}

SCRIPT:
"""
${script.trim()}
"""`;
}
