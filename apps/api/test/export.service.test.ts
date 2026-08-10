import { describe, expect, it } from "vitest";
import {
  ExportService,
  packMediaName,
} from "../src/export/export.service";
import type { ProjectsService } from "../src/projects/projects.service";

type ProjectPayload = Awaited<ReturnType<ProjectsService["findOne"]>>;

function scene(patch: Record<string, unknown>) {
  return {
    id: "s1",
    projectId: "p1",
    order: 0,
    title: "Opening beat",
    voiceText: "Welcome to the episode.",
    imagePrompt: null,
    videoPrompt: null,
    durationSec: 12,
    status: "PENDING",
    createdAt: new Date("2026-07-30T10:00:00.000Z"),
    assets: [],
    activeFrameId: null,
    activeVideoId: null,
    activeVoiceId: null,
    activeMusicId: null,
    ...patch,
  };
}

function musicAsset(id: string, file: string, durationSec: number | null) {
  return {
    id,
    sceneId: null,
    projectId: "p1",
    type: "MUSIC",
    provider: "upload",
    prompt: file,
    status: "READY",
    url: `/api/uploads/${file}`,
    durationSec,
    errorMsg: null,
    createdAt: new Date("2026-07-30T10:00:00.000Z"),
  };
}

function serviceFor(
  scenes: unknown[],
  music: { assets?: unknown[]; activeMusicId?: string | null } = {},
) {
  const project = {
    id: "p1",
    title: "Deep Sea",
    status: "PRODUCING",
    script: { content: "Narration.", wordCount: 1, estSeconds: 1 },
    scenes,
    assets: music.assets ?? [],
    activeMusicId: music.activeMusicId ?? null,
  } as unknown as ProjectPayload;

  return new ExportService({
    findOne: async () => project,
  } as unknown as ProjectsService);
}

describe("ExportService prompts format", () => {
  it("writes one block per scene with both prompts", async () => {
    const service = serviceFor([
      scene({ imagePrompt: "Wide shot of a trench", videoPrompt: "Slow push-in" }),
      scene({
        id: "s2",
        order: 1,
        title: "Descent",
        imagePrompt: "Submersible lights",
        videoPrompt: "Tilt down",
      }),
    ]);

    const result = await service.export("u1", "p1", "prompts");

    expect(result.filename).toBe("deep-sea.txt");
    expect(result.content).toContain("# 1. Opening beat");
    expect(result.content).toContain("IMAGE: Wide shot of a trench");
    expect(result.content).toContain("VIDEO: Slow push-in");
    expect(result.content).toContain("# 2. Descent");
  });

  it("keeps empty scenes in place so blocks match scene numbers", async () => {
    const service = serviceFor([scene({ imagePrompt: "   " })]);

    const result = await service.export("u1", "p1", "prompts");

    expect(result.content).toContain("IMAGE: (none)");
    expect(result.content).toContain("VIDEO: (none)");
  });
});

describe("packMediaName", () => {
  it("renames uploads to readable scene names", () => {
    expect(
      packMediaName(1, "frame", "Hook: Half Isn't Human", "/u/x/1786311356831-1.jpg"),
    ).toBe("scene-01-hook-half-isnt-human.jpg");
    expect(packMediaName(3, "voice", "Core", "C:\\Users\\ARS\\v.wav")).toBe(
      "scene-03-core-voice.wav",
    );
  });

  it("transliterates Cyrillic scene names instead of collapsing them", () => {
    expect(packMediaName(1, "frame", "Хук: Половина", "/u/x/1.jpg")).toBe(
      "scene-01-huk-polovina.jpg",
    );
  });
});

describe("ExportService resolve pack", () => {
  it("packs both timelines and subtitles into a base64 zip", async () => {
    const service = serviceFor([scene({ videoPrompt: "Slow push-in" })]);

    const result = await service.export("u1", "p1", "resolve-pack");

    expect(result.filename).toBe("deep-sea.zip");
    expect(result.encoding).toBe("base64");
    const zip = Buffer.from(result.content, "base64");
    expect(zip.subarray(0, 2).toString("latin1")).toBe("PK");
    // Имена файлов внутри архива лежат открытым текстом в заголовках.
    for (const name of ["project.fcpxml", "project-premiere.xml", "subtitles.srt"]) {
      expect(zip.toString("latin1")).toContain(name);
    }
  });
});

/** Две сцены по 12 секунд — 360 кадров каждая при 30 fps. */
const SCENE_FRAMES = 360;
const frames = (n: number) => `${n * 100}/3000s`;

describe("ExportService music track", () => {
  it("lays the project track across the whole timeline, not per scene", async () => {
    const track = musicAsset("m1", "score.mp3", 60);
    const service = serviceFor([scene({}), scene({ id: "s2", order: 1 })], {
      assets: [track],
      activeMusicId: "m1",
    });

    const result = await service.export("u1", "p1", "fcpxml");

    // Один непрерывный кусок на обе сцены, своей дорожкой под голосом.
    expect(result.content).toContain(
      `lane="-2" offset="${frames(0)}" duration="${frames(SCENE_FRAMES * 2)}" start="${frames(0)}" audioRole="music"`,
    );
  });

  it("stops the project track where the file ends instead of looping it", async () => {
    // Трек 5 секунд, ролик 24 — хвост остаётся без музыки.
    const track = musicAsset("m1", "stinger.mp3", 5);
    const service = serviceFor([scene({}), scene({ id: "s2", order: 1 })], {
      assets: [track],
      activeMusicId: "m1",
    });

    const result = await service.export("u1", "p1", "fcpxml");

    expect(result.content).toContain(
      `lane="-2" offset="${frames(0)}" duration="${frames(150)}"`,
    );
    // Дорожка кончается вместе с файлом, а не тянется на весь ролик.
    expect(result.content).not.toContain(
      `lane="-2" offset="${frames(0)}" duration="${frames(SCENE_FRAMES * 2)}"`,
    );
  });

  it("cuts the project track out where a scene brings its own", async () => {
    const track = musicAsset("m1", "score.mp3", 60);
    const override = { ...musicAsset("m2", "accent.mp3", null), sceneId: "s2" };
    const service = serviceFor(
      [
        scene({}),
        scene({
          id: "s2",
          order: 1,
          assets: [override],
          activeMusicId: "m2",
        }),
      ],
      { assets: [track], activeMusicId: "m1" },
    );

    const result = await service.export("u1", "p1", "fcpxml");

    // Базовый трек звучит только до второй сцены...
    expect(result.content).toContain(
      `lane="-2" offset="${frames(0)}" duration="${frames(SCENE_FRAMES)}" start="${frames(0)}"`,
    );
    // ...а на её отрезке играет её собственный, с начала файла.
    expect(result.content).toContain(
      `lane="-2" offset="${frames(SCENE_FRAMES)}" duration="${frames(SCENE_FRAMES)}" start="${frames(0)}"`,
    );
    expect(result.content).toContain("accent.mp3");
  });

  it("writes nothing to the music lane when no track is chosen", async () => {
    const service = serviceFor([scene({})]);

    const result = await service.export("u1", "p1", "fcpxml");

    expect(result.content).not.toContain('lane="-2"');
  });
});
