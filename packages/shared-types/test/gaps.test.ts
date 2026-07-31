import { describe, expect, it } from "vitest";
import type { Asset, Scene } from "../src";
import { projectGaps } from "../src";

function asset(patch: Partial<Asset> = {}): Asset {
  return {
    id: "a1",
    sceneId: "s1",
    type: "IMAGE",
    provider: "upload",
    prompt: "",
    status: "READY",
    url: "/uploads/a1.png",
    durationSec: null,
    errorMsg: null,
    createdAt: "2026-07-30T10:00:00.000Z",
    ...patch,
  };
}

/** Сцена, у которой закрыто всё — от неё отнимают по одному в тестах. */
function completeScene(patch: Partial<Scene> = {}): Scene {
  const frame = asset({ id: "frame", type: "IMAGE" });
  const clip = asset({ id: "clip", type: "VIDEO" });
  const voice = asset({ id: "voice", type: "VOICE", durationSec: 12 });

  return {
    id: "s1",
    projectId: "p1",
    order: 0,
    title: "Opening beat",
    voiceText: "Welcome to the episode.",
    imagePrompt: "Wide shot",
    videoPrompt: "Slow push-in",
    durationSec: 12,
    status: "READY",
    createdAt: "2026-07-30T10:00:00.000Z",
    assets: [frame, clip, voice],
    activeFrameId: frame.id,
    activeVideoId: clip.id,
    activeVoiceId: voice.id,
    activeMusicId: null,
    ...patch,
  };
}

function kinds(scenes: Scene[]): string[] {
  return projectGaps(scenes).map((g) => g.kind);
}

describe("projectGaps", () => {
  it("reports nothing for a finished scene", () => {
    expect(projectGaps([completeScene()])).toEqual([]);
  });

  it("counts a generated-but-unchosen asset as missing", () => {
    // Готовый ассет, который не выбран активным, в монтаж не попадёт —
    // «что-то сгенерировано» и «слот закрыт» это разные вещи.
    const scene = completeScene({ activeFrameId: null });
    expect(kinds([scene])).toContain("no-frame");
  });

  it("does not count an asset that is still generating", () => {
    const pending = asset({ id: "frame", status: "GENERATING", url: null });
    const scene = completeScene({
      assets: [pending, asset({ id: "clip", type: "VIDEO" }), asset({ id: "voice", type: "VOICE", durationSec: 12 })],
    });
    expect(kinds([scene])).toContain("no-frame");
  });

  it("flags empty text fields", () => {
    const scene = completeScene({
      voiceText: "   ",
      imagePrompt: "",
      videoPrompt: null,
    });
    const found = kinds([scene]);
    expect(found).toContain("empty-voiceover");
    expect(found).toContain("no-image-prompt");
    expect(found).toContain("no-video-prompt");
  });

  it("flags a voice track that runs out before the scene does", () => {
    const short = asset({ id: "voice", type: "VOICE", durationSec: 4 });
    const scene = completeScene({
      durationSec: 12,
      assets: [
        asset({ id: "frame" }),
        asset({ id: "clip", type: "VIDEO" }),
        short,
      ],
    });

    const gap = projectGaps([scene]).find(
      (g) => g.kind === "voice-shorter-than-scene",
    );
    expect(gap?.detail).toBe("4s of 12s");
  });

  it("tolerates a second of rounding either way", () => {
    const voice = asset({ id: "voice", type: "VOICE", durationSec: 11.5 });
    const scene = completeScene({
      durationSec: 12,
      assets: [
        asset({ id: "frame" }),
        asset({ id: "clip", type: "VIDEO" }),
        voice,
      ],
    });
    expect(kinds([scene])).not.toContain("voice-shorter-than-scene");
  });

  it("does not complain about length when there is no voice at all", () => {
    const scene = completeScene({ activeVoiceId: null });
    const found = kinds([scene]);
    expect(found).toContain("no-voice");
    expect(found).not.toContain("voice-shorter-than-scene");
  });
});
