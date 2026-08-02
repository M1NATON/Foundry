import { z } from "zod";
import { ProjectStatus } from "./enums";
import { AssetSchema, type Asset } from "./asset";
import { DURATION_MISMATCH_THRESHOLD_SECONDS } from "./scene";
import {
  VISUAL_STYLE_CUSTOM_MAX,
  VisualStyleKeySchema,
} from "./visual-style";

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
  /** Короткий бриф: о чём ролик, для кого и в каком тоне. */
  brief: z.string().trim().max(600).nullable().optional(),
  /** null — стиль не выбран на проекте, берётся дефолт пользователя. */
  visualStyle: VisualStyleKeySchema.nullable().optional(),
  visualStyleCustom: z
    .string()
    .trim()
    .max(VISUAL_STYLE_CUSTOM_MAX)
    .nullable()
    .optional(),
  coverUrl: z.string().url().nullable().optional(),
  status: ProjectStatus.optional(),
});
export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  brief: z.string().nullable(),
  visualStyle: VisualStyleKeySchema.nullable(),
  visualStyleCustom: z.string().nullable(),
  coverUrl: z.string().nullable(),
  status: ProjectStatus,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

/**
 * Музыка проекта: выбранный базовый трек и варианты, что лежат рядом.
 * Форма та же, что у ассетов сцены, — генерация, загрузка и статусы общие.
 */
export const ProjectMusicSchema = z.object({
  activeMusicId: z.string().nullable(),
  assets: z.array(AssetSchema),
});
export type ProjectMusic = z.infer<typeof ProjectMusicSchema>;

/** Выбор базового трека; null снимает музыку с проекта. */
export const SetProjectMusicSchema = z.object({
  assetId: z.string().nullable(),
});
export type SetProjectMusicDto = z.infer<typeof SetProjectMusicSchema>;

/** Базовый трек проекта, если он выбран, существует и готов. */
export function activeProjectMusic(music: ProjectMusic): Asset | null {
  return music.assets.find((a) => a.id === music.activeMusicId) ?? null;
}

/**
 * Насколько базовый трек не дотягивает до конца ролика. В экспорт он идёт
 * один раз, а не зацикливается, — значит хвост останется без музыки, и об
 * этом честнее сказать заранее, чем обнаружить это в монтажке.
 */
export function projectMusicShortfall(
  track: Asset | null,
  totalSeconds: number,
): number | null {
  if (track?.status !== "READY" || track.durationSec == null) return null;

  const shortfall = totalSeconds - track.durationSec;
  return shortfall > DURATION_MISMATCH_THRESHOLD_SECONDS ? shortfall : null;
}

/** Проект в списке — с агрегатами для карточки библиотеки. */
export const ProjectListItemSchema = ProjectSchema.extend({
  sceneCount: z.number(),
  wordCount: z.number(),
  estSeconds: z.number(),
});
export type ProjectListItem = z.infer<typeof ProjectListItemSchema>;
