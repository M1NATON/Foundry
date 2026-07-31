"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProject } from "@/lib/queries/projects";
import { useScenes, useUpdateSceneField } from "@/lib/queries/scenes";
import { useScript } from "@/lib/queries/script";
import { useEditor } from "@/lib/editor-store";
import { EditorChrome } from "@/components/editor/editor-chrome";
import { Stage } from "@/components/editor/stage";
import { Timeline } from "@/components/editor/timeline";
import { LeftRail } from "@/components/editor/left-rail";
import { FloatingToolbar } from "@/components/editor/floating-toolbar";
import { ScriptOverlay } from "@/components/editor/script-overlay";
import { InspectorPanel } from "@/components/editor/inspector-panel";
import { ExportPanel } from "@/components/export/export-panel";

export default function EditorPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: project, isLoading, isError } = useProject(projectId);
  const { data: scenes } = useScenes(projectId);
  const updateSceneField = useUpdateSceneField(projectId);
  const { data: script } = useScript(projectId);
  const { tool, setTool, selectedSceneId } = useEditor();
  const [exportOpen, setExportOpen] = useState(false);

  if (isError) {
    return (
      <main className="flex h-screen items-center justify-center">
        <p className="text-sm text-secondary">
          Project not found.{" "}
          <button
            onClick={() => router.push("/")}
            className="text-accent underline underline-offset-4"
          >
            Back to library
          </button>
        </p>
      </main>
    );
  }

  if (isLoading || !project) {
    return (
      <main className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-pulse rounded-full bg-border" />
      </main>
    );
  }

  const selectedScene = scenes?.find((s) => s.id === selectedSceneId) ?? null;

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-bg">
      <EditorChrome
        title={project.title}
        status={project.status}
        onExport={() => setExportOpen(true)}
      />

      <div className="relative flex min-h-0 flex-1">
        <LeftRail onExport={() => setExportOpen(true)} />

        <div className="relative flex min-w-0 flex-1 flex-col">
          <Stage
            scene={selectedScene}
            script={script ?? null}
            onUpdateSceneField={updateSceneField}
            onOpenScript={() => setTool("script")}
          />

          <Timeline
            projectId={projectId}
            scenes={scenes ?? []}
            script={script ?? null}
          />

          <FloatingToolbar
            active={tool}
            onSelect={(t) => setTool(tool === t ? null : t)}
            projectId={projectId}
            sceneCount={scenes?.length ?? 0}
          />
        </div>

        <ScriptOverlay
          projectId={projectId}
          open={tool === "script"}
          onClose={() => setTool(null)}
        />

        <InspectorPanel
          projectId={projectId}
          scene={selectedScene}
          scenes={scenes ?? []}
          sceneCount={scenes?.length ?? 0}
          tool={tool}
          onUpdateSceneField={updateSceneField}
          onClose={() => setTool(null)}
        />
      </div>

      <ExportPanel
        projectId={projectId}
        open={exportOpen}
        onClose={() => setExportOpen(false)}
      />
    </main>
  );
}
