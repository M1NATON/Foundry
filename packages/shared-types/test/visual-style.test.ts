import { describe, expect, it } from "vitest";
import {
  DEFAULT_VISUAL_STYLE,
  VISUAL_STYLE_PRESETS,
  buildScriptFromTopicPrompt,
  buildStoryboardPrompt,
  effectiveVisualStyle,
  resolveVisualStyle,
  visualStyleHint,
} from "../src";

describe("visual style", () => {
  it("puts every preset into both templates", () => {
    for (const preset of VISUAL_STYLE_PRESETS) {
      if (preset.key === "custom") continue;

      for (const prompt of [
        buildStoryboardPrompt("The ocean floor is unmapped.", "en", {
          key: preset.key,
        }),
        buildScriptFromTopicPrompt("Deep sea", null, "short", "en", {
          key: preset.key,
        }),
      ]) {
        expect(prompt).toContain(preset.prompt);
      }
    }
  });

  /**
   * Пресет специально противоположен тому, что модель выдаёт по умолчанию:
   * на мягкую формулировку она отвечает похожим, но всё ещё тёмным кадром.
   */
  it("spells out what flat illustration is not", () => {
    const prompt = resolveVisualStyle({ key: "flat-illustration" });

    expect(prompt).toContain("pastel");
    expect(prompt).toContain("Do not produce photorealism");
    expect(prompt).toMatch(/dark or moody lighting/);
    expect(prompt).toContain("transparent");
  });

  it("uses the writer's own words when they picked custom", () => {
    const custom = "Hand-drawn ink on warm paper, sparse linework.";

    expect(resolveVisualStyle({ key: "custom", custom })).toBe(custom);
    expect(visualStyleHint({ key: "custom", custom })).toBe(custom);
    expect(
      buildStoryboardPrompt("The ocean floor.", "en", { key: "custom", custom }),
    ).toContain(custom);
  });

  /** Пустое поле — недозаполненный ввод, а не выбор «без стиля». */
  it("falls back to the default preset when custom text is blank", () => {
    const fallback = resolveVisualStyle({ key: DEFAULT_VISUAL_STYLE });

    expect(resolveVisualStyle({ key: "custom", custom: "   " })).toBe(fallback);
    expect(resolveVisualStyle({ key: "custom", custom: null })).toBe(fallback);
    expect(resolveVisualStyle(null)).toBe(fallback);
  });

  it("prefers the project's style, then the writer's default", () => {
    const project = { key: "photorealistic" as const };
    const settings = { key: "flat-illustration" as const };

    expect(effectiveVisualStyle(project, settings)).toBe(project);
    // Проект ничего не выбирал — берётся вкус пользователя.
    expect(effectiveVisualStyle(null, settings)).toBe(settings);
    expect(effectiveVisualStyle(null, null)).toEqual({
      key: DEFAULT_VISUAL_STYLE,
    });
  });
});
