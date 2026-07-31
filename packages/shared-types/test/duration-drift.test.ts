import { describe, expect, it } from "vitest";
import type { Asset, Scene } from "../src";
import {
  DURATION_MISMATCH_THRESHOLD_SECONDS,
  assetDurationDrift,
  hasDurationMismatch,
  sceneDuration,
} from "../src";

function asset(patch: Partial<Asset> = {}): Asset {
  return {
    id: "a1",
    sceneId: "s1",
    projectId: null,
    type: "VIDEO",
    provider: "upload",
    prompt: "",
    status: "READY",
    url: "/uploads/a1.mp4",
    durationSec: 10,
    errorMsg: null,
    createdAt: "2026-07-31T10:00:00.000Z",
    ...patch,
  };
}

function scene(patch: Partial<Scene> = {}): Scene {
  return {
    id: "s1",
    projectId: "p1",
    order: 0,
    title: "Opening beat",
    // 25 слов при 150 wpm — оценка ровно 10 секунд.
    voiceText: "word ".repeat(25).trim(),
    imagePrompt: null,
    videoPrompt: null,
    durationSec: null,
    status: "READY",
    createdAt: "2026-07-31T10:00:00.000Z",
    assets: [],
    activeFrameId: null,
    activeVideoId: null,
    activeVoiceId: null,
    activeMusicId: null,
    ...patch,
  };
}

describe("sceneDuration", () => {
  it("prefers the measured voice file over the text estimate", () => {
    const voice = asset({ id: "v", type: "VOICE", durationSec: 3.2 });

    expect(
      sceneDuration(scene({ assets: [voice], activeVoiceId: voice.id })),
    ).toEqual({ seconds: 3.2, source: "voice-asset" });
  });

  it("falls back to the estimate while there is no voice file", () => {
    expect(sceneDuration(scene())).toEqual({
      seconds: 10,
      source: "estimated",
    });
  });

  it("ignores a voice asset that is not chosen or not ready yet", () => {
    const unchosen = asset({ id: "v", type: "VOICE", durationSec: 3 });
    const generating = asset({
      id: "v2",
      type: "VOICE",
      durationSec: null,
      status: "GENERATING",
    });

    // Готовый, но не выбранный вариант в сборку не пойдёт — и длину сцены
    // диктовать не должен.
    expect(sceneDuration(scene({ assets: [unchosen] })).source).toBe(
      "estimated",
    );
    expect(
      sceneDuration(scene({ assets: [generating], activeVoiceId: generating.id }))
        .source,
    ).toBe("estimated");
  });

  it("never lets the clip or the music define the scene length", () => {
    const clip = asset({ id: "c", type: "VIDEO", durationSec: 8 });
    const music = asset({ id: "m", type: "MUSIC", durationSec: 60 });

    const result = sceneDuration(
      scene({ assets: [clip, music], activeVideoId: clip.id, activeMusicId: music.id }),
    );

    expect(result).toEqual({ seconds: 10, source: "estimated" });
  });
});

describe("assetDurationDrift", () => {
  it("reports how much longer or shorter the file is", () => {
    expect(assetDurationDrift(asset({ durationSec: 10 }), 3)).toBe(7);
    expect(assetDurationDrift(asset({ durationSec: 3 }), 10)).toBe(-7);
  });

  it("stays quiet inside the tolerance", () => {
    const within = 10 + DURATION_MISMATCH_THRESHOLD_SECONDS;
    expect(assetDurationDrift(asset({ durationSec: within }), 10)).toBeNull();
    expect(assetDurationDrift(asset({ durationSec: 10 }), 10)).toBeNull();
  });

  it("has nothing to compare for voice and stills", () => {
    // Голос сам и есть эталон; у картинки длительности не бывает.
    expect(
      assetDurationDrift(asset({ type: "VOICE", durationSec: 3 }), 10),
    ).toBeNull();
    expect(
      assetDurationDrift(asset({ type: "IMAGE", durationSec: null }), 10),
    ).toBeNull();
  });

  it("says nothing when the file length is unknown", () => {
    expect(assetDurationDrift(asset({ durationSec: null }), 10)).toBeNull();
  });
});

describe("hasDurationMismatch", () => {
  it("flags a scene whose clip does not match its voice", () => {
    const voice = asset({ id: "v", type: "VOICE", durationSec: 3 });
    const clip = asset({ id: "c", type: "VIDEO", durationSec: 10 });

    expect(
      hasDurationMismatch(
        scene({
          assets: [voice, clip],
          activeVoiceId: voice.id,
          activeVideoId: clip.id,
        }),
      ),
    ).toBe(true);
  });

  it("keeps quiet when everything lines up", () => {
    const voice = asset({ id: "v", type: "VOICE", durationSec: 10 });
    const clip = asset({ id: "c", type: "VIDEO", durationSec: 10 });

    expect(
      hasDurationMismatch(
        scene({
          assets: [voice, clip],
          activeVoiceId: voice.id,
          activeVideoId: clip.id,
        }),
      ),
    ).toBe(false);
  });

  it("looks at every asset, not only the chosen one", () => {
    // Вариант, который лежит в сцене про запас, тоже стоит проверить:
    // выбрать его могут в любой момент.
    const spare = asset({ id: "c2", type: "VIDEO", durationSec: 30 });
    expect(hasDurationMismatch(scene({ assets: [spare] }))).toBe(true);
  });
});
