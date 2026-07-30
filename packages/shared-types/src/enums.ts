import { z } from "zod";

export const ProjectStatus = z.enum([
  "DRAFT",
  "RESEARCH",
  "SCRIPTING",
  "STORYBOARDING",
  "PRODUCING",
  "READY",
]);
export type ProjectStatus = z.infer<typeof ProjectStatus>;

export const SceneStatus = z.enum(["PENDING", "GENERATING", "READY", "FAILED"]);
export type SceneStatus = z.infer<typeof SceneStatus>;

export const AssetType = z.enum(["IMAGE", "VIDEO", "VOICE", "MUSIC"]);
export type AssetType = z.infer<typeof AssetType>;

export const AssetStatus = z.enum(["QUEUED", "GENERATING", "READY", "FAILED"]);
export type AssetStatus = z.infer<typeof AssetStatus>;

export const ExportFormat = z.enum(["md", "txt", "json", "csv", "srt"]);
export type ExportFormat = z.infer<typeof ExportFormat>;

/** Порядок этапов пайплайна — используется для прогресс-бара в Project Library. */
export const PIPELINE_STAGES: ProjectStatus[] = [
  "DRAFT",
  "RESEARCH",
  "SCRIPTING",
  "STORYBOARDING",
  "PRODUCING",
  "READY",
];

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  DRAFT: "Draft",
  RESEARCH: "Research",
  SCRIPTING: "Script",
  STORYBOARDING: "Storyboard",
  PRODUCING: "Producing",
  READY: "Ready",
};

export function projectProgress(status: ProjectStatus): number {
  const idx = PIPELINE_STAGES.indexOf(status);
  return (idx + 1) / PIPELINE_STAGES.length;
}
