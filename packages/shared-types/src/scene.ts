import { z } from "zod";
import { AssetType, SceneStatus } from "./enums";
import { AssetSchema } from "./asset";

export const CreateSceneSchema = z.object({
  title: z.string().trim().min(1).max(200),
  voiceText: z.string().default(""),
  imagePrompt: z.string().nullable().optional(),
  videoPrompt: z.string().nullable().optional(),
  durationSec: z.number().int().nonnegative().nullable().optional(),
  order: z.number().int().nonnegative().optional(),
});
export type CreateSceneDto = z.infer<typeof CreateSceneSchema>;

export const UpdateSceneSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  voiceText: z.string().optional(),
  imagePrompt: z.string().nullable().optional(),
  videoPrompt: z.string().nullable().optional(),
  durationSec: z.number().int().nonnegative().nullable().optional(),
  status: SceneStatus.optional(),
});
export type UpdateSceneDto = z.infer<typeof UpdateSceneSchema>;

export const ReorderScenesSchema = z.object({
  items: z
    .array(
      z.object({
        sceneId: z.string(),
        newOrder: z.number().int().nonnegative(),
      }),
    )
    .min(1),
});
export type ReorderScenesDto = z.infer<typeof ReorderScenesSchema>;

export const SceneSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  order: z.number(),
  title: z.string(),
  voiceText: z.string(),
  imagePrompt: z.string().nullable(),
  videoPrompt: z.string().nullable(),
  durationSec: z.number().nullable(),
  status: SceneStatus,
  createdAt: z.string(),
  assets: z.array(AssetSchema),
  activeFrameId: z.string().nullable(),
  activeVideoId: z.string().nullable(),
  activeVoiceId: z.string().nullable(),
  activeMusicId: z.string().nullable(),
});
export type Scene = z.infer<typeof SceneSchema>;

/** AssetType -> поле сцены со ссылкой на активный ассет этого типа. */
export const ACTIVE_ASSET_FIELD_BY_TYPE = {
  IMAGE: "activeFrameId",
  VIDEO: "activeVideoId",
  VOICE: "activeVoiceId",
  MUSIC: "activeMusicId",
} as const satisfies Record<
  z.infer<typeof AssetType>,
  "activeFrameId" | "activeVideoId" | "activeVoiceId" | "activeMusicId"
>;

export const SetActiveAssetSchema = z.object({
  type: AssetType,
  assetId: z.string(),
});
export type SetActiveAssetDto = z.infer<typeof SetActiveAssetSchema>;

/** Активный ассет заданного типа для сцены, если он выбран и существует. */
export function activeAssetOf(scene: Scene, type: z.infer<typeof AssetType>) {
  const activeId = scene[ACTIVE_ASSET_FIELD_BY_TYPE[type]];
  return scene.assets.find((a) => a.id === activeId) ?? null;
}
