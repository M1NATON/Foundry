import { Injectable, Logger } from "@nestjs/common";
import { z } from "zod";
import { countWords, estimateSeconds, extractJson } from "@foundry/shared-types";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SPLIT_PROMPT = [
  "You are a video production assistant. Split the following narration script into scenes.",
  "Return STRICTLY a JSON array (no markdown, no code fences, no prose) where each item has exactly these fields:",
  '"title" (string, max 8 words), "voiceText" (string, the narration for this scene, taken from the script),',
  '"imagePrompt" (string, a cinematic still-image prompt), "videoPrompt" (string, a short camera-motion prompt),',
  '"durationSec" (integer, estimated narration seconds).',
  "Script:",
].join("\n");

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
  async splitIntoScenes(scriptContent: string): Promise<LlmScene[]> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return this.localSplit(scriptContent);

    try {
      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${SPLIT_PROMPT}\n${scriptContent}` }],
            },
          ],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini responded with ${response.status}`);
      }

      const payload: unknown = await response.json();
      const parsed = GeminiResponseSchema.parse(payload);
      const text = parsed.candidates[0].content.parts
        .map((part) => part.text)
        .join("");

      return LlmScenesSchema.parse(JSON.parse(extractJson(text)));
    } catch (error) {
      this.logger.warn(
        `Gemini split failed, falling back to local split: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return this.localSplit(scriptContent);
    }
  }

  /** Абзац = сцена. Полностью детерминировано, без сети. */
  private localSplit(scriptContent: string): LlmScene[] {
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
        imagePrompt: `Cinematic establishing shot: ${firstSentence(chunk)}. Muted natural palette, 35mm, shallow depth of field.`,
        videoPrompt: "Slow push-in, 4s, subtle parallax.",
        durationSec: estimateSeconds(countWords(chunk)),
      };
    });
  }
}

function firstSentence(text: string): string {
  const match = text.match(/[^.!?]+/);
  return (match?.[0] ?? text).trim().replace(/\s+/g, " ");
}
