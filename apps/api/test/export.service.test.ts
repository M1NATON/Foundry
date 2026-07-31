import { describe, expect, it } from "vitest";
import { ExportService } from "../src/export/export.service";
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

function serviceFor(scenes: unknown[]) {
  const project = {
    id: "p1",
    title: "Deep Sea",
    status: "PRODUCING",
    script: { content: "Narration.", wordCount: 1, estSeconds: 1 },
    scenes,
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
