import { z } from "zod";
import { WORDS_PER_MINUTE, estimateSpeechSeconds } from "./script";
import { visualStyleBlock, type VisualStyleChoice } from "./visual-style";

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
  durationSec: z.number().positive().optional(),
});
export type StoryboardScene = z.infer<typeof StoryboardSceneSchema>;

const StoryboardObjectSchema = z.object({
  projectTitle: z.string().trim().min(1).max(200).optional(),
  /**
   * Цельный текст сценария. Его присылает только bootstrap-шаблон: при
   * разбивке готового скрипта источник уже лежит в проекте. Поле опционально,
   * поэтому оба ответа разбираются одним и тем же кодом.
   */
  fullScript: optionalText,
  totalDurationSec: z.number().nonnegative().optional(),
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
  const fallback = estimateSpeechSeconds(scene.voiceText);
  return Math.max(MIN_SCENE_SECONDS, scene.durationSec ?? fallback);
}

/**
 * Два режима промпта — не выбор пользователя, а состояние проекта: пока
 * сценария нет, разбивать нечего и модель пишет его сама; как только текст
 * появился, он становится источником правды и переписывать его нельзя.
 */
export type StoryboardPromptMode = "from-topic" | "from-script";

export function storyboardPromptMode(script: string): StoryboardPromptMode {
  return script.trim() ? "from-script" : "from-topic";
}

/**
 * Целевая длина ролика. Без явной цифры модель почти всегда выбирает
 * «покороче» и выдаёт пересказ вместо сценария, поэтому в bootstrap-шаблоне
 * таргет задаётся жёстко, а не остаётся на её усмотрение.
 */
export const SCRIPT_LENGTH_PRESETS = [
  { key: "short", label: "Short", hint: "1–1.5 min", target: "1-1.5 minutes" },
  { key: "standard", label: "Standard", hint: "2.5–3 min", target: "2.5-3 minutes" },
  { key: "long", label: "Long", hint: "5–6 min", target: "5-6 minutes" },
] as const;

export type ScriptLengthKey = (typeof SCRIPT_LENGTH_PRESETS)[number]["key"];

export const DEFAULT_SCRIPT_LENGTH: ScriptLengthKey = "standard";

export function scriptLengthTarget(key: ScriptLengthKey): string {
  const preset = SCRIPT_LENGTH_PRESETS.find((p) => p.key === key);
  return (preset ?? SCRIPT_LENGTH_PRESETS[1]).target;
}

/**
 * Язык итогового текста. Список расширяемый: чтобы добавить язык, хватает
 * строки здесь — ни шаблоны, ни интерфейс трогать не нужно.
 */
export const SCRIPT_LANGUAGES = [
  { key: "ru", label: "Русский", promptName: "Russian" },
  { key: "en", label: "English", promptName: "English" },
  { key: "uk", label: "Українська", promptName: "Ukrainian" },
  { key: "es", label: "Español", promptName: "Spanish" },
  { key: "de", label: "Deutsch", promptName: "German" },
  { key: "fr", label: "Français", promptName: "French" },
] as const;

export type ScriptLanguageKey = (typeof SCRIPT_LANGUAGES)[number]["key"];

export const DEFAULT_SCRIPT_LANGUAGE: ScriptLanguageKey = "ru";

export function scriptLanguageName(key: ScriptLanguageKey): string {
  const found = SCRIPT_LANGUAGES.find((l) => l.key === key);
  return (found ?? SCRIPT_LANGUAGES[0]).promptName;
}

/**
 * Язык уже написанного текста. Родственные языки одной письменности по буквам
 * надёжно не различить, поэтому определяем только письменность и берём для неё
 * язык по умолчанию — переключатель рядом остаётся в любом случае.
 */
export function detectScriptLanguage(
  text: string,
  fallback: ScriptLanguageKey = DEFAULT_SCRIPT_LANGUAGE,
): ScriptLanguageKey {
  const letters = text.match(/\p{L}/gu)?.length ?? 0;
  if (!letters) return fallback;

  const cyrillic = text.match(/\p{Script=Cyrillic}/gu)?.length ?? 0;
  return cyrillic / letters > 0.3 ? "ru" : "en";
}

/**
 * Требование к языку — отдельной явной строкой, а не намёком через язык самой
 * инструкции. Модель точнее следует английским инструкциям, но контент ролика
 * нужен на языке автора: это две независимые вещи, и смешивать их нельзя.
 */
function outputLanguage(
  language: ScriptLanguageKey,
  fields: string,
): string {
  return `OUTPUT LANGUAGE
- Write ${fields} in ${scriptLanguageName(language)}.
- imagePrompt and videoPrompt stay in English — they are fed to image and video generators, not read by a person.
- Every instruction in this prompt stays in English; only the generated content follows the language above.
- Do not translate or rename the JSON keys — field names stay exactly as shown in the output format.`;
}

/**
 * Общие для обоих шаблонов требования к картинке. Держатся вместе, потому что
 * расходиться им нельзя: сцены из разных режимов попадают в один ролик.
 */
const VISUAL_VARIETY = `- Vary shot type across scenes: mix wide establishing shots, medium shots, and close-ups/macro. Do not use "cinematic close-up" for every single scene.
- imagePrompt: detailed visual description — composition, subject, mood, lighting, style, consistent with the chosen visual world. No text/logos in the prompt.
- videoPrompt: same visual as imagePrompt but describe camera motion / subject motion for a short clip (push-in, pan, orbit, subject turns, particles drifting, etc). Vary the motion type across scenes — not every scene should be "slow push-in."`;

/**
 * Длительность просим оценивать по темпу речи, а не по жёсткой норме слов в
 * секунду: на числах и терминах диктор притормаживает, и сцена, посчитанная
 * «по словам», обрезает фразу на монтаже.
 */
const DURATION_RULES = `- Estimate duration from actual speaking pace, not a rigid word count: dense/informational sentences read slightly slower, short punchy phrases read faster. Add extra time for scenes with numbers, technical terms, or names, since these are read more carefully.
- Minimum ${MIN_SCENE_SECONDS} seconds per scene.
- durationSec: number, one decimal place allowed (e.g. 8.4).`;

/**
 * Шаблон A: текст уже написан — модель обязана разложить именно его.
 * Визуальный стиль задаётся до сцен: иначе каждая картинка сочиняется
 * отдельно и получается набор случайных кадров, а не связный ролик.
 */
export function buildStoryboardPrompt(
  script: string,
  language: ScriptLanguageKey = DEFAULT_SCRIPT_LANGUAGE,
  style?: VisualStyleChoice | null,
): string {
  return `You are a professional YouTube video storyboard writer.

TASK
Take the script below and split it into scenes for video production.
Return ONLY valid JSON, no markdown code fences, no commentary before or after.

${outputLanguage(language, "each scene's title")}
- voiceText is copied from the script verbatim and therefore keeps the language of the source — do not translate it.

${visualStyleBlock(style)}

SCENE BREAKS
- Split narration into natural scene breaks — each scene is one visual beat / one idea.
- Do not make every scene the same length. Vary scene length based on content weight: a simple statement can be a short scene (5-8s), a complex or important idea deserves a longer scene (15-25s) so it isn't rushed.
- voiceText must be an exact, word-for-word segment of the original script — do not paraphrase or summarize it. Every word of the input script must appear in exactly one scene's voiceText, in order.

VISUAL VARIETY
${VISUAL_VARIETY}

DURATION
${DURATION_RULES}

STRUCTURE
- order starts at 1 and increments per scene.
- totalDurationSec: sum of all scene durations.
- projectTitle: infer a short working title from the script content.

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

/**
 * Шаблон B: сценария нет — модель пишет его по теме и сразу режет на сцены.
 * Таргет по длительности обязателен: без него ответ съезжает в короткий
 * пересказ. Готовый текст возвращается отдельным полем fullScript, чтобы
 * дальше его можно было править целиком, а не только по кускам сцен.
 */
export function buildScriptFromTopicPrompt(
  topic: string,
  brief: string | null | undefined,
  length: ScriptLengthKey = DEFAULT_SCRIPT_LENGTH,
  language: ScriptLanguageKey = DEFAULT_SCRIPT_LANGUAGE,
  style?: VisualStyleChoice | null,
): string {
  const trimmedBrief = brief?.trim();
  const topicBlock = trimmedBrief
    ? `${topic.trim()}\n\n${trimmedBrief}`
    : topic.trim();

  return `You are a professional YouTube scriptwriter and storyboard artist.

TASK
Write a complete narration script on the topic below, then split it into scenes for video production.
Return ONLY valid JSON, no markdown code fences, no commentary before or after.

${outputLanguage(language, "fullScript, every voiceText and every scene title")}

TOPIC
${topicBlock}

TARGET LENGTH
Write a script that results in approximately ${scriptLengthTarget(length)} of narration at natural speaking pace. This is a hard target — do not write a short summary. Cover the topic with real depth: context, the core explanation, at least one concrete example or number, a complication or nuance, and a closing thought. A rushed, surface-level script that skips depth to save time is a failure condition.

SCRIPT STRUCTURE
Follow a clear narrative arc:
1. Hook — an opening line that creates curiosity or tension, not a dry definition.
2. Context — why this topic matters right now.
3. Core explanation — the main substance, broken into clear steps or points.
4. Concrete detail — at least one specific example, number, or case that makes it tangible.
5. Complication or nuance — a limitation, risk, or open question (avoid a flat "everything is great" narrative).
6. Closing thought — a takeaway or forward-looking line, not just a summary restatement.

${visualStyleBlock(style)}

SCENE BREAKS
- Split the script into natural scene breaks — one visual beat / one idea per scene.
- Vary scene length based on content weight — simple statements can be short (5-8s), complex or important ideas deserve more time (15-25s).

VISUAL VARIETY
${VISUAL_VARIETY}

DURATION
${DURATION_RULES}

STRUCTURE
- order starts at 1 and increments per scene.
- totalDurationSec: sum of all scene durations — should land close to the target length above.
- projectTitle: a short working title for the video.
- fullScript: the complete narration text, as continuous prose (not split), so it can be saved and edited separately from the scene breakdown.

OUTPUT FORMAT (exact shape, no extra fields, no missing fields):
{
  "projectTitle": "string",
  "fullScript": "string",
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
}`;
}

/**
 * Запасной путь к сценарию: если модель проигнорировала fullScript, текст
 * собирается обратно из сцен. Хуже по разбивке на абзацы, но лучше, чем
 * оставить проект вообще без редактируемого скрипта.
 */
export function scriptFromScenes(
  scenes: Array<Pick<StoryboardScene, "voiceText">>,
): string {
  return scenes
    .map((scene) => scene.voiceText.trim())
    .filter(Boolean)
    .join("\n\n");
}
