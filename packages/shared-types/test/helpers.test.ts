import { describe, expect, it } from "vitest";
import type { Asset, Scene } from "../src";
import {
  StoryboardImportSchema,
  countWords,
  estimateSeconds,
  estimateSpeechSeconds,
  extractJson,
  formatDuration,
  formatSceneDuration,
  hasDefaultTitle,
  isAssetPending,
  projectProgress,
  sceneDurationSec,
  sceneReadiness,
  sceneSeconds,
} from "../src";

function asset(id: string, type: Asset["type"], status: Asset["status"]): Asset {
  return {
    id,
    sceneId: "s1",
    type,
    status,
    url: status === "READY" ? `/uploads/${id}` : null,
    durationSec: null,
    provider: "gemini",
    prompt: "",
    errorMsg: null,
    createdAt: "2026-07-30T10:00:00.000Z",
  };
}

function scene(patch: Partial<Scene> = {}): Scene {
  return {
    id: "s1",
    projectId: "p1",
    order: 0,
    title: "Opening beat",
    voiceText: "",
    imagePrompt: null,
    videoPrompt: null,
    durationSec: null,
    status: "PENDING",
    createdAt: "2026-07-30T10:00:00.000Z",
    assets: [],
    activeFrameId: null,
    activeVideoId: null,
    activeVoiceId: null,
    activeMusicId: null,
    ...patch,
  };
}

describe("script helpers", () => {
  it("counts whitespace-separated words", () => {
    expect(countWords("  one\n two\tthree  ")).toBe(3);
    expect(countWords("   ")).toBe(0);
  });

  it("estimates narration duration at 150 words per minute", () => {
    expect(estimateSeconds(150)).toBe(60);
    expect(estimateSeconds(25)).toBe(10);
  });

  it("formats and clamps durations", () => {
    expect(formatDuration(65.4)).toBe("1:05");
    expect(formatDuration(-10)).toBe("0:00");
  });
});

describe("estimateSpeechSeconds", () => {
  // 4 слова при 150 словах в минуту — 1.6 секунды чистой начитки.
  it("counts words at the narration pace when there is no punctuation", () => {
    expect(estimateSpeechSeconds("one two three four")).toBe(1.6);
    expect(estimateSpeechSeconds("   ")).toBe(0);
  });

  it("adds a pause for every punctuation mark", () => {
    // 1.6 начитки + 0.2 на запятую + 0.45 на точку.
    expect(estimateSpeechSeconds("one two, three four.")).toBe(2.3);
  });

  it("separates scenes with the same word count but different phrasing", () => {
    const flat = estimateSpeechSeconds("stop look listen now");
    const punctuated = estimateSpeechSeconds("stop. look. listen. now.");

    expect(punctuated).toBeGreaterThan(flat);
  });

  it("treats a run of marks as one pause", () => {
    // «...» и «!» — две остановки, а не четыре.
    expect(estimateSpeechSeconds("Wait... Look!")).toBe(1.7);
  });

  it("does not mistake a hyphen inside a word for a pause", () => {
    expect(estimateSpeechSeconds("well-known fact")).toBe(0.8);
    // Тире отдельным словом — настоящая пауза.
    expect(estimateSpeechSeconds("да — вот так")).toBe(1.4);
  });
});

describe("formatSceneDuration", () => {
  it("keeps the tenth of a second under a minute", () => {
    expect(formatSceneDuration(8.44)).toBe("0:08.4");
    expect(formatSceneDuration(3)).toBe("0:03.0");
    expect(formatSceneDuration(-5)).toBe("0:00.0");
  });

  it("falls back to the shared format once the tenth stops mattering", () => {
    expect(formatSceneDuration(65.4)).toBe("1:05");
    // Округление десятых не должно давать «0:60.0».
    expect(formatSceneDuration(59.97)).toBe("1:00");
  });
});

describe("pipeline helpers", () => {
  it("maps project stages to monotonic progress", () => {
    expect(projectProgress("DRAFT")).toBeCloseTo(1 / 6);
    expect(projectProgress("STORYBOARDING")).toBeCloseTo(4 / 6);
    expect(projectProgress("READY")).toBe(1);
  });

  it("recognizes only active asset states as pending", () => {
    expect(isAssetPending("QUEUED")).toBe(true);
    expect(isAssetPending("GENERATING")).toBe(true);
    expect(isAssetPending("READY")).toBe(false);
    expect(isAssetPending("FAILED")).toBe(false);
  });

  it("recognizes empty and default project titles", () => {
    expect(hasDefaultTitle(" ")).toBe(true);
    expect(hasDefaultTitle("Untitled project")).toBe(true);
    expect(hasDefaultTitle("Episode 12")).toBe(false);
  });
});

describe("storyboard helpers", () => {
  it("extracts JSON from model prose and markdown fences", () => {
    const response = 'Result:\n```json\n{"scenes": []}\n```\nDone';
    expect(extractJson(response)).toBe('{"scenes": []}');
  });

  it("accepts a bare scene array and normalizes optional prompts", () => {
    const result = StoryboardImportSchema.parse([
      { title: "Opening", voiceText: "Welcome to the episode." },
    ]);

    expect(result.scenes[0]).toMatchObject({
      title: "Opening",
      imagePrompt: "",
      videoPrompt: "",
    });
  });

  it("enforces a minimum readable scene duration", () => {
    expect(
      sceneSeconds({
        title: "Short",
        voiceText: "Hello",
        imagePrompt: "",
        videoPrompt: "",
      }),
    ).toBe(3);
  });
});

describe("scene helpers", () => {
  it("falls back to the narration estimate when duration is unset", () => {
    expect(sceneDurationSec(scene({ durationSec: 40 }))).toBe(40);
    // 25 слов при 150 словах в минуту — 10 секунд.
    expect(
      sceneDurationSec(scene({ voiceText: "word ".repeat(25).trim() })),
    ).toBe(10);
  });

  it("never reports a scene shorter than the readable minimum", () => {
    expect(sceneDurationSec(scene({ durationSec: 0 }))).toBe(3);
    expect(sceneDurationSec(scene({ voiceText: "Hello" }))).toBe(3);
  });

  it("counts only active, ready assets as filled slots", () => {
    expect(sceneReadiness(scene())).toEqual({ filled: 0, total: 4 });

    const ready = asset("a1", "IMAGE", "READY");
    const generating = asset("a2", "VOICE", "GENERATING");
    const orphan = asset("a3", "MUSIC", "READY");

    expect(
      sceneReadiness(
        scene({
          assets: [ready, generating, orphan],
          activeFrameId: ready.id,
          activeVoiceId: generating.id,
          // a3 готов, но не выбран активным — слот не закрыт.
        }),
      ),
    ).toEqual({ filled: 1, total: 4 });
  });
});
