import { describe, expect, it } from "vitest";
import {
  StoryboardImportSchema,
  countWords,
  estimateSeconds,
  extractJson,
  formatDuration,
  hasDefaultTitle,
  isAssetPending,
  projectProgress,
  sceneSeconds,
} from "../src";

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
