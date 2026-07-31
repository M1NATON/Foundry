import { describe, expect, it } from "vitest";
import { sceneSecondsFromVoice } from "../src/assets/assets.service";
import { parseProbeDuration } from "../src/assets/media-duration";

describe("parseProbeDuration", () => {
  it("reads the seconds ffprobe printed", () => {
    expect(parseProbeDuration("12.480000\n")).toBe(12.48);
  });

  it("treats unknown and empty output as no duration", () => {
    // ffprobe печатает N/A для потоков без известной длительности —
    // это «неизвестно», а не ошибка и не ноль.
    expect(parseProbeDuration("N/A\n")).toBeNull();
    expect(parseProbeDuration("")).toBeNull();
    expect(parseProbeDuration("0\n")).toBeNull();
  });
});

describe("sceneSecondsFromVoice", () => {
  it("rounds up so the last phrase is not cut off", () => {
    expect(sceneSecondsFromVoice(12.1)).toBe(13);
    expect(sceneSecondsFromVoice(12)).toBe(12);
  });

  it("keeps the same readable minimum as the text estimate", () => {
    expect(sceneSecondsFromVoice(0.4)).toBe(3);
  });
});
