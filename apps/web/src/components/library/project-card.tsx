"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PROJECT_STATUS_LABEL, formatDuration, projectProgress } from "@foundry/shared-types";
import type { ProjectListItem } from "@foundry/shared-types";
import { Progress, RISE, SPRING, staggerDelay } from "@/components/ui/primitives";
import { cn, formatRelativeDate } from "@/lib/utils";

interface ProjectCardProps {
  project: ProjectListItem;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const progress = projectProgress(project.status);
  const isReady = project.status === "READY";

  return (
    <motion.div
      initial={RISE.initial}
      animate={RISE.animate}
      transition={{ ...SPRING, delay: staggerDelay(index) }}
    >
      <Link
        href={`/projects/${project.id}`}
        className="group block overflow-hidden rounded-xl border border-border bg-surface
                   transition-colors duration-200 hover:border-secondary/35"
      >
        <Cover project={project} />

        <div className="px-5 pb-5 pt-4">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-lg leading-tight tracking-tight">
              {project.title}
            </h3>
            <span className="shrink-0 text-xs text-secondary">
              {formatRelativeDate(project.updatedAt)}
            </span>
          </div>

          <p className="mt-1.5 text-xs text-secondary">
            {project.sceneCount > 0
              ? `${project.sceneCount} scene${project.sceneCount === 1 ? "" : "s"}`
              : "No scenes yet"}
            {project.wordCount > 0 && (
              <>
                {" · "}
                {project.wordCount.toLocaleString()} words
                {" · "}
                {formatDuration(project.estSeconds)}
              </>
            )}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <Progress value={progress} className="flex-1" />
            <span
              className={cn(
                "shrink-0 text-xs tabular-nums",
                isReady ? "text-accent" : "text-secondary",
              )}
            >
              {PROJECT_STATUS_LABEL[project.status]}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * Обложка 16:9. Если coverUrl нет — не серый плейсхолдер, а типографская
 * «литая» обложка: крупный инициал Fraunces на тёплом фоне со штриховкой.
 * Оттенок детерминирован по id, чтобы библиотека читалась как набор корешков книг.
 */
function Cover({ project }: { project: ProjectListItem }) {
  if (project.coverUrl) {
    return (
      <div className="aspect-video overflow-hidden border-b border-border bg-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.coverUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.02]"
        />
      </div>
    );
  }

  const initial = project.title.trim().charAt(0).toUpperCase() || "F";
  const tone = hashTone(project.id);

  return (
    <div
      className={cn(
        "relative flex aspect-video items-center justify-center overflow-hidden border-b border-border",
        tone,
      )}
    >
      <div className="hatch absolute inset-0 opacity-45" />
      <span className="relative font-display text-3xl leading-none tracking-tighter text-primary/85">
        {initial}
      </span>
    </div>
  );
}

/** Три допустимых фона — все из палитры, без выхода за токены. */
function hashTone(id: string): string {
  const TONES = ["bg-accent-soft", "bg-bg", "bg-border/60"];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return TONES[Math.abs(hash) % TONES.length];
}
