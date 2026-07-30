import { z } from "zod";
import { ProjectStatus } from "./enums";

/** Заголовок нового проекта. Импорт раскадровки перезаписывает только его. */
export const DEFAULT_PROJECT_TITLE = "Untitled project";

export function hasDefaultTitle(title: string): boolean {
  const trimmed = title.trim();
  return trimmed === "" || trimmed.toLowerCase() === DEFAULT_PROJECT_TITLE.toLowerCase();
}

export const CreateProjectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  coverUrl: z.string().url().optional().nullable(),
});
export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  coverUrl: z.string().url().nullable().optional(),
  status: ProjectStatus.optional(),
});
export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  coverUrl: z.string().nullable(),
  status: ProjectStatus,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

/** Проект в списке — с агрегатами для карточки библиотеки. */
export const ProjectListItemSchema = ProjectSchema.extend({
  sceneCount: z.number(),
  wordCount: z.number(),
  estSeconds: z.number(),
});
export type ProjectListItem = z.infer<typeof ProjectListItemSchema>;
