import { z } from "zod";
import { AssetType, SceneStatus } from "./enums";
import { AssetSchema } from "./asset";
import { countWords, estimateSeconds } from "./script";
import { MIN_SCENE_SECONDS } from "./storyboard";

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

/**
 * Длительность сцены для таймлайна и списка раскадровки: явная, если её
 * посчитал бэкенд, иначе оценка по темпу начитки. Один источник правды,
 * чтобы ширина блока на таймлайне и подпись в списке не разъезжались.
 */
export function sceneDurationSec(
  scene: Pick<Scene, "durationSec" | "voiceText">,
): number {
  const fallback = estimateSeconds(countWords(scene.voiceText));
  return Math.max(MIN_SCENE_SECONDS, scene.durationSec ?? fallback);
}

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

/** Слоты сцены в порядке пайплайна: кадр → клип → голос → музыка. */
export const SCENE_ASSET_SLOTS = ["IMAGE", "VIDEO", "VOICE", "MUSIC"] as const;

/**
 * Готовность сцены: сколько слотов уже закрыто выбранным готовым ассетом.
 * Считаются именно активные ассеты — просто «что-то сгенерировано» не значит,
 * что этот вариант выбран для сборки.
 */
export function sceneReadiness(scene: Scene): { filled: number; total: number } {
  const filled = SCENE_ASSET_SLOTS.filter(
    (type) => activeAssetOf(scene, type)?.status === "READY",
  ).length;
  return { filled, total: SCENE_ASSET_SLOTS.length };
}

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
