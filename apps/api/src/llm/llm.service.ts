import { Injectable, Logger } from "@nestjs/common";
import { z } from "zod";
import {
  estimateSpeechSeconds,
  extractJson,
  visualStyleHint,
  type VisualStyleChoice,
} from "@foundry/shared-types";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Стиль вшивается в описание поля, а не приписывается к промпту сверху:
 * просьба «сделай плоскую пастель» под требованием «cinematic still-image
 * prompt» — это противоречие, и модель разрешает его в пользу первого,
 * что прочитала.
 */
function splitPrompt(style: VisualStyleChoice | null | undefined): string {
  const look = visualStyleHint(style);
  return [
    "You are a video production assistant. Split the following narration script into scenes.",
    "Return STRICTLY a JSON array (no markdown, no code fences, no prose) where each item has exactly these fields:",
    '"title" (string, max 8 words), "voiceText" (string, the narration for this scene, taken from the script),',
    `"imagePrompt" (string, a still-image prompt in this exact visual style: ${look}),`,
    '"videoPrompt" (string, a short camera-motion prompt),',
    '"durationSec" (integer, estimated narration seconds).',
    "Every imagePrompt must stay in that same visual style — do not switch styles between scenes.",
    "Script:",
  ].join("\n");
}

function promptsPrompt(style: VisualStyleChoice | null | undefined): string {
  const look = visualStyleHint(style);
  return [
    "You are a video production assistant. Read the narration of a single scene.",
    "Return STRICTLY a JSON object (no markdown, no code fences, no prose) with exactly these fields:",
    `"imagePrompt" (string, a still-image prompt for this scene in this exact visual style: ${look}),`,
    '"videoPrompt" (string, a short camera-motion prompt for this scene).',
    "Narration:",
  ].join("\n");
}

const ScenePromptsSchema = z.object({
  imagePrompt: z.string().default(""),
  videoPrompt: z.string().default(""),
});

export type ScenePrompts = z.infer<typeof ScenePromptsSchema>;

const LlmSceneSchema = z.object({
  title: z.string().trim().min(1),
  voiceText: z.string().default(""),
  imagePrompt: z.string().default(""),
  videoPrompt: z.string().default(""),
  durationSec: z.number().int().nonnegative(),
});

const LlmScenesSchema = z.array(LlmSceneSchema).min(1);

export type LlmScene = z.infer<typeof LlmSceneSchema>;

const GeminiResponseSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z.object({
          parts: z.array(z.object({ text: z.string() })),
        }),
      }),
    )
    .min(1),
});

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  /**
   * Разбивает скрипт на сцены. Ключ Gemini опционален: без него (и при любой
   * ошибке провайдера) работает детерминированный локальный фолбэк, поэтому
   * приложение остаётся полностью функциональным без внешних сервисов.
   */
  async splitIntoScenes(
    scriptContent: string,
    style?: VisualStyleChoice | null,
  ): Promise<LlmScene[]> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return this.localSplit(scriptContent, style);

    try {
      const text = await this.generate(
        apiKey,
        `${splitPrompt(style)}\n${scriptContent}`,
      );
      return LlmScenesSchema.parse(JSON.parse(extractJson(text)));
    } catch (error) {
      this.logger.warn(
        `Gemini split failed, falling back to local split: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return this.localSplit(scriptContent, style);
    }
  }

  /**
   * Промпты кадра и клипа по тексту сцены — когда начитку переписали,
   * а промпты остались от прошлой версии. Как и split, работает без
   * ключа Gemini: локальный фолбэк собирает их из первой фразы.
   */
  async promptsFor(
    voiceText: string,
    style?: VisualStyleChoice | null,
  ): Promise<ScenePrompts> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey || !voiceText.trim()) return localPrompts(voiceText, style);

    try {
      const text = await this.generate(
        apiKey,
        `${promptsPrompt(style)}\n${voiceText}`,
      );
      return ScenePromptsSchema.parse(JSON.parse(extractJson(text)));
    } catch (error) {
      this.logger.warn(
        `Gemini prompts failed, falling back to local prompts: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return localPrompts(voiceText, style);
    }
  }

  /** Один вызов Gemini: ответ ожидается строго как JSON. */
  private async generate(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini responded with ${response.status}`);
    }

    const payload: unknown = await response.json();
    const parsed = GeminiResponseSchema.parse(payload);
    return parsed.candidates[0].content.parts.map((part) => part.text).join("");
  }

  /** Абзац = сцена. Полностью детерминировано, без сети. */
  private localSplit(
    scriptContent: string,
    style?: VisualStyleChoice | null,
  ): LlmScene[] {
    const paragraphs = scriptContent
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const chunks = paragraphs.length > 0 ? paragraphs : [scriptContent.trim()];

    return chunks.map((chunk) => {
      const words = chunk.split(/\s+/).filter(Boolean);
      const title =
        words.slice(0, 6).join(" ") + (words.length > 6 ? "…" : "") ||
        "Untitled scene";

      return {
        title,
        voiceText: chunk,
        ...localPrompts(chunk, style),
        durationSec: estimateSpeechSeconds(chunk),
      };
    });
  }
}

/**
 * Детерминированные промпты по тексту сцены — без сети и без ключа.
 * Стиль подставляется и сюда: фолбэк, который всегда выдаёт кинематограф,
 * молча ломал бы выбор пользователя ровно там, где ключа Gemini нет.
 */
function localPrompts(
  text: string,
  style?: VisualStyleChoice | null,
): ScenePrompts {
  if (!text.trim()) return { imagePrompt: "", videoPrompt: "" };
  return {
    imagePrompt: `${firstSentence(text)}. ${visualStyleHint(style)}.`,
    videoPrompt: "Slow push-in, 4s, subtle parallax.",
  };
}

function firstSentence(text: string): string {
  const match = text.match(/[^.!?]+/);
  return (match?.[0] ?? text).trim().replace(/\s+/g, " ");
}
