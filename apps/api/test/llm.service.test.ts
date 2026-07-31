import { Logger } from "@nestjs/common";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LlmService } from "../src/llm/llm.service";

describe("LlmService", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("splits paragraphs locally when Gemini is not configured", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");

    const scenes = await new LlmService().splitIntoScenes(
      "First paragraph has a concise opening.\n\nSecond paragraph closes the story.",
    );

    expect(scenes).toHaveLength(2);
    expect(scenes[0]).toMatchObject({
      title: "First paragraph has a concise opening.",
      voiceText: "First paragraph has a concise opening.",
      videoPrompt: "Slow push-in, 4s, subtle parallax.",
    });
    expect(scenes[0].durationSec).toBeGreaterThanOrEqual(1);
  });

  it("falls back to the deterministic split when Gemini fails", async () => {
    vi.stubEnv("GEMINI_API_KEY", "configured");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 503 }),
    );
    vi.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);

    const scenes = await new LlmService().splitIntoScenes("Offline fallback.");

    expect(scenes).toHaveLength(1);
    expect(scenes[0].voiceText).toBe("Offline fallback.");
    expect(fetch).toHaveBeenCalledOnce();
  });
});

describe("LlmService prompts", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds prompts from the first sentence when Gemini is not configured", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");

    const prompts = await new LlmService().promptsFor(
      "A trench opens below. The lights go out.",
    );

    expect(prompts.imagePrompt).toContain("A trench opens below");
    expect(prompts.videoPrompt).not.toBe("");
  });

  it("returns empty prompts for a scene without voiceover", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");

    expect(await new LlmService().promptsFor("   ")).toEqual({
      imagePrompt: "",
      videoPrompt: "",
    });
  });
});
