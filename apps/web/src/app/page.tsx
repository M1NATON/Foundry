"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { useCreateProject, useProjects } from "@/lib/queries/projects";
import { ProjectCard } from "@/components/library/project-card";
import { EmptyLibrary } from "@/components/library/empty-library";
import { NewProjectRow } from "@/components/library/new-project-row";
import { SettingsDialog } from "@/components/library/settings-dialog";

export default function LibraryPage() {
  const { data: projects, isLoading, isError } = useProjects();
  const createProject = useCreateProject();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isEmpty = !isLoading && projects?.length === 0;

  return (
    <main className="mx-auto min-h-screen max-w-shell px-gutter py-18">
      <header className="mb-12 flex items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-2xl leading-tight tracking-tight">
            Library
          </h1>
          <p className="mt-2 max-w-reading text-base text-secondary">
            Every video you&rsquo;re building, from first note to final export.
          </p>
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
          title="Settings"
          className="shrink-0 rounded-sm p-1.5 text-secondary transition-colors hover:text-primary"
        >
          <Settings size={16} strokeWidth={1.5} />
        </button>
      </header>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {!isEmpty && (
        <NewProjectRow
          onCreate={(title) => createProject.mutate({ title })}
          pending={createProject.isPending}
        />
      )}

      {isError && (
        <p className="max-w-reading text-sm text-secondary">
          Couldn&rsquo;t reach the API. Make sure it&rsquo;s running on{" "}
          <code className="text-primary">localhost:4000</code>.
        </p>
      )}

      {isLoading && <SkeletonGrid />}

      {isEmpty && (
        <EmptyLibrary
          onCreate={() => createProject.mutate({ title: "Untitled project" })}
          pending={createProject.isPending}
        />
      )}

      {projects && projects.length > 0 && (
        <div className="grid grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 gap-6" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border bg-surface"
        >
          <div className="aspect-video animate-pulse bg-border/40" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-2/3 animate-pulse rounded-sm bg-border/50" />
            <div className="h-3 w-1/3 animate-pulse rounded-sm bg-border/40" />
          </div>
        </div>
      ))}
    </div>
  );
}
