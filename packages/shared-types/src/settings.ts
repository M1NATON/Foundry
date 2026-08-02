import { z } from "zod";
import {
  DEFAULT_VISUAL_STYLE,
  VISUAL_STYLE_CUSTOM_MAX,
  VisualStyleKeySchema,
} from "./visual-style";

/**
 * Настройки пользователя. Пока в них живёт единственное — стиль для новых
 * проектов: у автора обычно один любимый визуальный язык, и выбирать его
 * заново для каждого ролика незачем.
 */
export const UserSettingsSchema = z.object({
  defaultVisualStyle: VisualStyleKeySchema,
  defaultVisualStyleCustom: z.string().nullable(),
});
export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const UpdateUserSettingsSchema = z.object({
  defaultVisualStyle: VisualStyleKeySchema.optional(),
  defaultVisualStyleCustom: z
    .string()
    .trim()
    .max(VISUAL_STYLE_CUSTOM_MAX)
    .nullable()
    .optional(),
});
export type UpdateUserSettingsDto = z.infer<typeof UpdateUserSettingsSchema>;

/** Настройки пользователя, который ничего не менял. */
export const DEFAULT_USER_SETTINGS: UserSettings = {
  defaultVisualStyle: DEFAULT_VISUAL_STYLE,
  defaultVisualStyleCustom: null,
};
