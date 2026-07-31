"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProject } from "@/lib/queries/projects";
import { EditorChrome } from "@/components/editor/editor-chrome";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { LeftRail } from "@/components/editor/left-rail";
import { ExportPanel } from "@/components/export/export-panel";

export default function EditorPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: project, isLoading, isError } = useProject(projectId);
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

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-bg">
      <EditorChrome
        title={project.title}
        status={project.status}
        onExport={() => setExportOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        <LeftRail />
        <EditorWorkspace
          projectId={projectId}
          onExport={() => setExportOpen(true)}
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
