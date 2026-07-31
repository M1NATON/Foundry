import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Scene, Script } from "@foundry/shared-types";
import { describe, expect, it } from "vitest";
import { EditorWorkspace } from "../src/components/editor/editor-workspace";
import { EditorProvider, type EditorStep } from "../src/lib/editor-store";
import { sceneKeys } from "../src/lib/queries/scenes";
import { scriptKeys } from "../src/lib/queries/script";

const PROJECT_ID = "p1";
const SCENE_ID = "s1";

const SCRIPT_PLACEHOLDER = "Start writing the narration";
const SCENE_TITLE = "Opening beat";

function scene(voiceText: string): Scene {
  return {
    id: SCENE_ID,
    projectId: PROJECT_ID,
    order: 0,
    title: SCENE_TITLE,
    voiceText,
    imagePrompt: null,
    videoPrompt: null,
    durationSec: 12,
    status: "PENDING",
    createdAt: "2026-07-30T10:00:00.000Z",
    assets: [],
    activeFrameId: null,
    activeVideoId: null,
    activeVoiceId: null,
    activeMusicId: null,
  };
}

const script: Script = {
  id: "sc1",
  projectId: PROJECT_ID,
  content: "Narration draft for the whole video.",
  wordCount: 6,
  estSeconds: 2,
  updatedAt: "2026-07-30T10:00:00.000Z",
};

function seed(voiceText: string) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  qc.setQueryData(sceneKeys.list(PROJECT_ID), [scene(voiceText)]);
  qc.setQueryData(scriptKeys.detail(PROJECT_ID), script);
  return qc;
}

function render(qc: QueryClient, step: EditorStep): string {
  return renderToStaticMarkup(
    <QueryClientProvider client={qc}>
      <EditorProvider initialStep={step} initialSelectedSceneId={SCENE_ID}>
        <EditorWorkspace projectId={PROJECT_ID} />
      </EditorProvider>
    </QueryClientProvider>,
  );
}

describe("EditorWorkspace", () => {
  it("renders Producing without the script editor", () => {
    const markup = render(seed("Original voiceover"), "producing");

    expect(markup).toContain(SCENE_TITLE);
    expect(markup).toContain("Original voiceover");
    expect(markup).not.toContain(SCRIPT_PLACEHOLDER);
  });

  it("replaces the canvas with Script instead of layering over it", () => {
    const markup = render(seed("Original voiceover"), "script");

    expect(markup).toContain(SCRIPT_PLACEHOLDER);
    expect(markup).toContain(script.content);
    // Канвас и таймлайн не должны просвечивать сквозь Script — именно это
    // ломалось, когда Script был оверлеем поверх смонтированного канваса.
    expect(markup).not.toContain(SCENE_TITLE);
    expect(markup).not.toContain("Original voiceover");
  });

  it("lists scenes on Storyboard without the per-scene production fields", () => {
    const markup = render(seed("Original voiceover"), "storyboard");

    expect(markup).toContain(SCENE_TITLE);
    expect(markup).not.toContain("Original voiceover");
    expect(markup).not.toContain(SCRIPT_PLACEHOLDER);
  });

  it("keeps scene edits across Producing → Script → Producing", () => {
    const qc = seed("Original voiceover");

    expect(render(qc, "producing")).toContain("Original voiceover");

    // Правка поля сцены — ровно то, что делает useUpdateSceneField:
    // оптимистичная запись в кеш списка сцен.
    qc.setQueryData<Scene[]>(sceneKeys.list(PROJECT_ID), (old) =>
      old?.map((s) => ({ ...s, voiceText: "Edited on the canvas" })),
    );

    render(qc, "script");

    // Канвас размонтировался и смонтировался заново — правка на месте,
    // потому что она живёт в кеше, а не в локальном стейте вида.
    const back = render(qc, "producing");
    expect(back).toContain("Edited on the canvas");
    expect(back).not.toContain("Original voiceover");
  });
});
