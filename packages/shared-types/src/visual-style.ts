import { z } from "zod";

/**
 * Визуальный стиль ролика. Раньше шаблоны просили модель придумать единый
 * визуальный мир самостоятельно — и она почти всегда выбирала тёмный
 * техно-нуар с неоном. Стиль задаёт человек, модель только держится за него.
 */

/**
 * Список расширяемый: чтобы добавить стиль, хватает записи здесь — ни шаблоны,
 * ни интерфейс трогать не нужно. `prompt` уходит во внешнюю модель, поэтому
 * пишется по-английски; `shot` задаёт тон коротким серверным промптам, где
 * места на полное описание нет.
 */
export const VISUAL_STYLE_PRESETS = [
  {
    key: "flat-illustration",
    label: "Flat illustration",
    hint: "Pastel vector, light background",
    /**
     * Признаки перечислены поимённо, а запреты вынесены отдельной строкой:
     * на короткое «flat illustration» модель отвечает чем-то похожим, но всё
     * равно тёмным и детализированным — этот пресет ровно против того, что
     * она выдаёт по умолчанию, поэтому и настойчивее остальных.
     */
    prompt: `Flat vector illustration, in the spirit of modern design-system artwork (unDraw / Storyset): simple geometric shapes, clean outlines, large areas of solid colour, and a soft pastel palette. Compositions are open and uncluttered, with generous empty space. Backgrounds are light, plain, or transparent. Lighting is even and flat.
This style is strictly non-photographic. Do not produce photorealism, 3D renders, dark or moody lighting, neon, dramatic shadows, cinematic depth of field, film grain, or heavy texture and detail. If a description would suit a live-action film still, it is wrong for this style.`,
    shot: "flat pastel vector illustration, simple shapes, light plain background, no photorealism",
  },
  {
    key: "cinematic-dark",
    label: "Cinematic dark tech",
    hint: "Dramatic light, futuristic",
    prompt: `Cinematic dark technology aesthetic: dramatic directional lighting, deep shadows, a dark and moody palette with a single accent colour, and a futuristic or high-tech atmosphere. Framing is filmic — shallow depth of field, considered composition, and a sense of scale.`,
    shot: "cinematic still, dramatic lighting, dark futuristic palette, shallow depth of field",
  },
  {
    key: "photorealistic",
    label: "Photorealistic",
    hint: "Real photography, natural light",
    prompt: `Realistic photography with no stylisation: natural light, believable materials and textures, and colour as a camera would record it. Looks like a photograph taken on location, not an illustration, a render, or a graded film still.`,
    shot: "realistic photograph, natural light, no stylisation",
  },
  {
    key: "abstract-geometric",
    label: "Abstract geometric",
    hint: "Lines, grids, no objects",
    prompt: `Abstract geometric composition: lines, grids, planes, and simple geometric forms arranged rhythmically. No recognisable objects, characters, places, or literal depictions of the subject — the visual carries meaning through structure, repetition, and negative space alone. A restrained palette of two or three colours.`,
    shot: "abstract geometric composition, lines and grids, no literal objects",
  },
  {
    key: "custom",
    label: "Custom",
    hint: "Describe it yourself",
    /** Заглушки: для custom описание приходит от пользователя. */
    prompt: "",
    shot: "",
  },
] as const;

export type VisualStyleKey = (typeof VISUAL_STYLE_PRESETS)[number]["key"];

export const VisualStyleKeySchema = z.enum(
  VISUAL_STYLE_PRESETS.map((preset) => preset.key) as [
    VisualStyleKey,
    ...VisualStyleKey[],
  ],
);

/**
 * Пресет по умолчанию — тот же тёмный кинематограф, что модель выбирала сама.
 * Так проект, где стиль никто не трогал, продолжает выглядеть как прежде:
 * смена дефолта переписала бы промпты давно собранным роликам.
 */
export const DEFAULT_VISUAL_STYLE: VisualStyleKey = "cinematic-dark";

/** Свободное описание длиной с бриф — оно уходит в промпт целиком. */
export const VISUAL_STYLE_CUSTOM_MAX = 600;

/** Выбор стиля: пресет и текст, осмысленный только для `custom`. */
export interface VisualStyleChoice {
  key: VisualStyleKey;
  custom?: string | null;
}

export const VisualStyleSchema = z.object({
  key: VisualStyleKeySchema,
  custom: z.string().trim().max(VISUAL_STYLE_CUSTOM_MAX).nullable().optional(),
});

function presetOf(key: VisualStyleKey) {
  return (
    VISUAL_STYLE_PRESETS.find((preset) => preset.key === key) ??
    VISUAL_STYLE_PRESETS.find((preset) => preset.key === DEFAULT_VISUAL_STYLE)!
  );
}

/**
 * Стиль, выбранный пользователем: пресет или его собственное описание.
 * Пустой custom — не выбор, а недозаполненное поле, поэтому такой стиль
 * откатывается к дефолтному пресету: промпт без визуальной части хуже,
 * чем промпт с чужим стилем.
 */
function chosen(style: VisualStyleChoice | null | undefined) {
  const key = style?.key ?? DEFAULT_VISUAL_STYLE;
  if (key === "custom") {
    const custom = style?.custom?.trim();
    // У самого `custom` описания нет — оно приходит от человека. Пустое поле
    // оставило бы промпт вообще без визуальной части.
    return custom
      ? { custom, preset: null }
      : { custom: null, preset: presetOf(DEFAULT_VISUAL_STYLE) };
  }
  return { custom: null, preset: presetOf(key) };
}

/** Полное описание стиля для больших шаблонов. */
export function resolveVisualStyle(
  style: VisualStyleChoice | null | undefined,
): string {
  const { custom, preset } = chosen(style);
  return custom ?? preset!.prompt;
}

/** Короткая формулировка для серверных промптов, где нет места на абзац. */
export function visualStyleHint(
  style: VisualStyleChoice | null | undefined,
): string {
  const { custom, preset } = chosen(style);
  return custom ?? preset!.shot;
}

/**
 * Блок стиля для шаблонов раскадровки. Требование единства между сценами
 * остаётся тем же, что и раньше, — меняется только то, что мир задан
 * человеком, а не сочиняется моделью с нуля.
 */
export function visualStyleBlock(
  style: VisualStyleChoice | null | undefined,
): string {
  return `VISUAL STYLE
Use this exact visual style for every scene:
${resolveVisualStyle(style)}

Stay inside this style for the whole video — do not switch styles between scenes, and do not substitute a different look you consider more cinematic. Within it, keep the video visually coherent: one setting, metaphor, or colour world carried across all scenes.`;
}

/**
 * Стиль, который реально применяется: выбранный на проекте, иначе дефолт
 * пользователя, иначе встроенный. `null` на проекте — это «как обычно», а не
 * «без стиля», поэтому наследование живёт здесь, а не в вызывающем коде.
 */
export function effectiveVisualStyle(
  project: VisualStyleChoice | null | undefined,
  fallback?: VisualStyleChoice | null,
): VisualStyleChoice {
  if (project?.key) return project;
  if (fallback?.key) return fallback;
  return { key: DEFAULT_VISUAL_STYLE };
}
