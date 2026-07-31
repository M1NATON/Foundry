import { z } from "zod";
import { AssetStatus, AssetType } from "./enums";

export const CreateAssetSchema = z.object({
  type: AssetType,
  /** Если не передан — берётся из imagePrompt/videoPrompt/voiceText сцены. */
  prompt: z.string().trim().min(1).optional(),
  provider: z.string().trim().min(1).default("gemini"),
});
export type CreateAssetDto = z.infer<typeof CreateAssetSchema>;

export const AssetSchema = z.object({
  id: z.string(),
  /**
   * Ассет принадлежит либо сцене, либо проекту — базовая музыка висит на
   * проекте и не привязана ни к одному блоку таймлайна.
   */
  sceneId: z.string().nullable(),
  projectId: z.string().nullable(),
  type: AssetType,
  provider: z.string(),
  prompt: z.string(),
  status: AssetStatus,
  url: z.string().nullable(),
  durationSec: z.number().nullable(),
  errorMsg: z.string().nullable(),
  createdAt: z.string(),
});
export type Asset = z.infer<typeof AssetSchema>;

export const ASSET_PENDING_STATUSES: Array<z.infer<typeof AssetStatus>> = [
  "QUEUED",
  "GENERATING",
];

export function isAssetPending(status: z.infer<typeof AssetStatus>): boolean {
  return ASSET_PENDING_STATUSES.includes(status);
}

/** Пакетная догенерация: какие типы слотов заполнять по всему проекту. */
export const GenerateMissingSchema = z.object({
  types: z.array(AssetType).min(1),
});
export type GenerateMissingDto = z.infer<typeof GenerateMissingSchema>;
