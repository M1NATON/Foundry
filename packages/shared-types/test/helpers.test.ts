import { describe, expect, it } from "vitest";
import type { Asset, Scene } from "../src";
import {
  SCRIPT_LANGUAGES,
  StoryboardImportSchema,
  buildScriptFromTopicPrompt,
  buildStoryboardPrompt,
  countWords,
  detectScriptLanguage,
  estimateSeconds,
  estimateSpeechSeconds,
  extractJson,
  formatDuration,
  formatSceneDuration,
  hasDefaultTitle,
  SCENE_ASSET_SLOTS,
  isAssetPending,
  musicForScene,
  projectProgress,
  sceneDurationSec,
  sceneReadiness,
  sceneSeconds,
  scriptFromScenes,
  scriptLanguageName,
  storyboardPromptMode,
} from "../src";

function asset(id: string, type: Asset["type"], status: Asset["status"]): Asset {
  return {
    id,
    sceneId: "s1",
    projectId: null,
    type,
    status,
    url: status === "READY" ? `/uploads/${id}` : null,
    durationSec: null,
    provider: "gemini",
    prompt: "",
    errorMsg: null,
    createdAt: "2026-07-30T10:00:00.000Z",
  };
}

function scene(patch: Partial<Scene> = {}): Scene {
  return {
    id: "s1",
    projectId: "p1",
    order: 0,
    title: "Opening beat",
    voiceText: "",
    imagePrompt: null,
    videoPrompt: null,
    durationSec: null,
    status: "PENDING",
    createdAt: "2026-07-30T10:00:00.000Z",
    assets: [],
    activeFrameId: null,
    activeVideoId: null,
    activeVoiceId: null,
    activeMusicId: null,
    ...patch,
  };
}

describe("script helpers", () => {
  it("counts whitespace-separated words", () => {
    expect(countWords("  one\n two\tthree  ")).toBe(3);
    expect(countWords("   ")).toBe(0);
  });

  it("estimates narration duration at 150 words per minute", () => {
    expect(estimateSeconds(150)).toBe(60);
    expect(estimateSeconds(25)).toBe(10);
  });

  it("formats and clamps durations", () => {
    expect(formatDuration(65.4)).toBe("1:05");
    expect(formatDuration(-10)).toBe("0:00");
  });
});

describe("estimateSpeechSeconds", () => {
  // 4 слова при 150 словах в минуту — 1.6 секунды чистой начитки.
  it("counts words at the narration pace when there is no punctuation", () => {
    expect(estimateSpeechSeconds("one two three four")).toBe(1.6);
    expect(estimateSpeechSeconds("   ")).toBe(0);
  });

  it("adds a pause for every punctuation mark", () => {
    // 1.6 начитки + 0.2 на запятую + 0.45 на точку.
    expect(estimateSpeechSeconds("one two, three four.")).toBe(2.3);
  });

  it("separates scenes with the same word count but different phrasing", () => {
    const flat = estimateSpeechSeconds("stop look listen now");
    const punctuated = estimateSpeechSeconds("stop. look. listen. now.");

    expect(punctuated).toBeGreaterThan(flat);
  });

  it("treats a run of marks as one pause", () => {
    // «...» и «!» — две остановки, а не четыре.
    expect(estimateSpeechSeconds("Wait... Look!")).toBe(1.7);
  });

  it("does not mistake a hyphen inside a word for a pause", () => {
    expect(estimateSpeechSeconds("well-known fact")).toBe(0.8);
    // Тире отдельным словом — настоящая пауза.
    expect(estimateSpeechSeconds("да — вот так")).toBe(1.4);
  });
});

describe("formatSceneDuration", () => {
  it("keeps the tenth of a second under a minute", () => {
    expect(formatSceneDuration(8.44)).toBe("0:08.4");
    expect(formatSceneDuration(3)).toBe("0:03.0");
    expect(formatSceneDuration(-5)).toBe("0:00.0");
  });

  it("falls back to the shared format once the tenth stops mattering", () => {
    expect(formatSceneDuration(65.4)).toBe("1:05");
    // Округление десятых не должно давать «0:60.0».
    expect(formatSceneDuration(59.97)).toBe("1:00");
  });
});

describe("pipeline helpers", () => {
  it("maps project stages to monotonic progress", () => {
    expect(projectProgress("DRAFT")).toBeCloseTo(1 / 6);
    expect(projectProgress("STORYBOARDING")).toBeCloseTo(4 / 6);
    expect(projectProgress("READY")).toBe(1);
  });

  it("recognizes only active asset states as pending", () => {
    expect(isAssetPending("QUEUED")).toBe(true);
    expect(isAssetPending("GENERATING")).toBe(true);
    expect(isAssetPending("READY")).toBe(false);
    expect(isAssetPending("FAILED")).toBe(false);
  });

  it("recognizes empty and default project titles", () => {
    expect(hasDefaultTitle(" ")).toBe(true);
    expect(hasDefaultTitle("Untitled project")).toBe(true);
    expect(hasDefaultTitle("Episode 12")).toBe(false);
  });
});

describe("storyboard helpers", () => {
  it("extracts JSON from model prose and markdown fences", () => {
    const response = 'Result:\n```json\n{"scenes": []}\n```\nDone';
    expect(extractJson(response)).toBe('{"scenes": []}');
  });

  it("accepts a bare scene array and normalizes optional prompts", () => {
    const result = StoryboardImportSchema.parse([
      { title: "Opening", voiceText: "Welcome to the episode." },
    ]);

    expect(result.scenes[0]).toMatchObject({
      title: "Opening",
      imagePrompt: "",
      videoPrompt: "",
    });
  });

  it("picks the prompt mode from the script, not from a user toggle", () => {
    expect(storyboardPromptMode("")).toBe("from-topic");
    expect(storyboardPromptMode("   \n ")).toBe("from-topic");
    expect(storyboardPromptMode("The ocean floor.")).toBe("from-script");
  });

  it("tells the model to split the script it was given", () => {
    const prompt = buildStoryboardPrompt("The ocean floor is unmapped.");

    expect(prompt).toContain("The ocean floor is unmapped.");
    expect(prompt).toContain("word-for-word segment of the original script");
    // Разбивке готового текста fullScript не нужен — он уже есть в проекте.
    expect(prompt).not.toContain("fullScript");
  });

  it("holds both templates to one visual style and varied shots", () => {
    for (const prompt of [
      buildStoryboardPrompt("The ocean floor is unmapped."),
      buildScriptFromTopicPrompt("Deep sea", null),
    ]) {
      // Стиль задан человеком, но требование не переключать его между
      // сценами осталось тем же, что и когда его выбирала модель.
      expect(prompt).toContain("Use this exact visual style for every scene");
      expect(prompt).toContain("do not switch styles between scenes");
      expect(prompt).not.toContain("decide on ONE consistent visual world");
      expect(prompt).toContain("Vary shot type across scenes");
      expect(prompt).toContain("one decimal place allowed");
    }
  });

  it("tells the model to write the script when there is none", () => {
    const prompt = buildScriptFromTopicPrompt("Deep sea", "For curious teens.");

    expect(prompt).toContain("Deep sea");
    expect(prompt).toContain("For curious teens.");
    expect(prompt).toContain("Follow a clear narrative arc");
    expect(prompt).toContain('"fullScript": "string"');
    // Форма сцен совпадает с режимом разбивки — импорт разбирает обе одинаково.
    expect(prompt).toContain('"voiceText": "string"');
  });

  it("pins a hard target length so the model does not write a summary", () => {
    expect(buildScriptFromTopicPrompt("Deep sea", null, "short")).toContain(
      "approximately 1-1.5 minutes",
    );
    expect(buildScriptFromTopicPrompt("Deep sea", null, "long")).toContain(
      "approximately 5-6 minutes",
    );
    // По умолчанию — стандартная длина, а не выбор модели.
    expect(buildScriptFromTopicPrompt("Deep sea", null)).toContain(
      "approximately 2.5-3 minutes",
    );
  });

  it("keeps the topic block clean when no brief was written", () => {
    const prompt = buildScriptFromTopicPrompt("Deep sea", "   ");

    expect(prompt).toContain("TOPIC\nDeep sea\n");
  });

  it("detects the language of what is already written", () => {
    expect(detectScriptLanguage("Дно океана почти не изучено.")).toBe("ru");
    expect(detectScriptLanguage("The ocean floor is unmapped.")).toBe("en");
    // Латиница в русском тексте не должна его перебивать.
    expect(detectScriptLanguage("Протокол MCP меняет всё.")).toBe("ru");
    // Пустому тексту язык взять неоткуда — остаётся значение по умолчанию.
    expect(detectScriptLanguage("", "en")).toBe("en");
    expect(detectScriptLanguage("12 :: 34", "en")).toBe("en");
  });

  it("states the content language while keeping instructions in English", () => {
    const prompt = buildScriptFromTopicPrompt("Deep sea", null, "short", "ru");

    expect(prompt).toContain("in Russian");
    // Инструкции остаются английскими — язык меняет только содержимое.
    expect(prompt).toContain("Every instruction in this prompt stays in English");
    expect(prompt).toContain("Follow a clear narrative arc");
    // Ключи JSON не переводятся — иначе импорт перестанет их находить.
    expect(prompt).toContain("Do not translate or rename the JSON keys");
    expect(prompt).toContain('"voiceText": "string"');
  });

  it("keeps image prompts in English whatever the narration language is", () => {
    for (const prompt of [
      buildStoryboardPrompt("Дно океана.", "ru"),
      buildScriptFromTopicPrompt("Глубина", null, "short", "ru"),
    ]) {
      expect(prompt).toContain("imagePrompt and videoPrompt stay in English");
    }
  });

  it("does not promise to translate a script it must copy verbatim", () => {
    const prompt = buildStoryboardPrompt("The ocean floor is unmapped.", "ru");

    expect(prompt).toContain("keeps the language of the source");
    expect(prompt).toContain("do not translate it");
    // Язык применяется к заголовкам, а не к начитке.
    expect(prompt).toContain("Write each scene's title in Russian");
  });

  it("names every language it offers", () => {
    for (const option of SCRIPT_LANGUAGES) {
      expect(scriptLanguageName(option.key)).toBe(option.promptName);
    }
  });

  it("accepts a storyboard with fullScript and one without", () => {
    const withScript = StoryboardImportSchema.parse({
      fullScript: "Whole narration.",
      scenes: [{ title: "Hook", voiceText: "Whole narration." }],
    });
    const without = StoryboardImportSchema.parse({
      scenes: [{ title: "Hook", voiceText: "Whole narration." }],
    });

    expect(withScript.fullScript).toBe("Whole narration.");
    expect(without.fullScript).toBe("");
  });

  it("rebuilds the script from the scenes the model returned", () => {
    expect(
      scriptFromScenes([
        { voiceText: "First beat." },
        { voiceText: "  " },
        { voiceText: " Second beat. " },
      ]),
    ).toBe("First beat.\n\nSecond beat.");
  });

  it("enforces a minimum readable scene duration", () => {
    expect(
      sceneSeconds({
        title: "Short",
        voiceText: "Hello",
        imagePrompt: "",
        videoPrompt: "",
      }),
    ).toBe(3);
  });
});

describe("scene helpers", () => {
  it("falls back to the narration estimate when duration is unset", () => {
    expect(sceneDurationSec(scene({ durationSec: 40 }))).toBe(40);
    // 25 слов при 150 словах в минуту — 10 секунд.
    expect(
      sceneDurationSec(scene({ voiceText: "word ".repeat(25).trim() })),
    ).toBe(10);
  });

  it("never reports a scene shorter than the readable minimum", () => {
    expect(sceneDurationSec(scene({ durationSec: 0 }))).toBe(3);
    expect(sceneDurationSec(scene({ voiceText: "Hello" }))).toBe(3);
  });

  it("counts only active, ready assets as filled slots", () => {
    expect(sceneReadiness(scene())).toEqual({ filled: 0, total: 3 });

    const ready = asset("a1", "IMAGE", "READY");
    const generating = asset("a2", "VOICE", "GENERATING");
    const spare = asset("a3", "IMAGE", "READY");

    expect(
      sceneReadiness(
        scene({
          assets: [ready, generating, spare],
          activeFrameId: ready.id,
          activeVoiceId: generating.id,
          // a3 готов, но не выбран активным — слот не закрыт.
        }),
      ),
    ).toEqual({ filled: 1, total: 3 });
  });

  it("does not ask a scene for music", () => {
    // Музыка живёт на проекте: сцена без неё готова так же, как с ней.
    const music = asset("m1", "MUSIC", "READY");
    const withMusic = scene({ assets: [music], activeMusicId: music.id });

    expect(sceneReadiness(withMusic)).toEqual(sceneReadiness(scene()));
    expect(SCENE_ASSET_SLOTS).not.toContain("MUSIC");
  });

  it("lets a scene override the project track", () => {
    const projectTrack = asset("p1", "MUSIC", "READY");
    const override = asset("m1", "MUSIC", "READY");

    expect(musicForScene(scene(), projectTrack)).toBe(projectTrack);
    expect(
      musicForScene(
        scene({ assets: [override], activeMusicId: override.id }),
        projectTrack,
      ),
    ).toBe(override);
    // Проектного трека нет и своего тоже — под сценой тишина.
    expect(musicForScene(scene(), null)).toBeNull();
  });
});
