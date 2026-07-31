import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  ACTIVE_ASSET_FIELD_BY_TYPE,
  MIN_SCENE_SECONDS,
  StoryboardImportSchema,
  countWords,
  estimateSeconds,
  extractJson,
  hasDefaultTitle,
  sceneSeconds,
  type CreateSceneDto,
  type ImportStoryboardDto,
  type ReorderScenesDto,
  type SetActiveAssetDto,
  type StoryboardImport,
  type UpdateSceneDto,
} from "@foundry/shared-types";
import { join } from "node:path";
import { probeDurationSec } from "../assets/media-duration";
import { UPLOAD_DIR } from "../assets/upload";
import { LlmService } from "../llm/llm.service";
import { PrismaService } from "../prisma/prisma.service";
import { ProjectsService } from "../projects/projects.service";

const WITH_ASSETS = {
  assets: { orderBy: { createdAt: "desc" } },
} as const;

@Injectable()
export class ScenesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly llm: LlmService,
  ) {}

  async findAll(userId: string, projectId: string) {
    await this.projects.assertOwned(userId, projectId);
    const scenes = await this.prisma.scene.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
      include: WITH_ASSETS,
    });

    await this.backfillDurations(scenes);
    return scenes;
  }

  /**
   * Длительность мерится при загрузке файла, но файлы, загруженные до
   * появления этой проверки, её не имеют — а без неё нечего сравнивать и
   * индикатор рассинхрона молчит. Домеряем один раз: после первого успеха
   * durationSec заполнен и сюда мы больше не заходим.
   */
  private async backfillDurations(
    scenes: Array<{ assets: Array<{ id: string; type: string; url: string | null; durationSec: number | null }> }>,
  ) {
    const prefix = `/api/${UPLOAD_DIR}/`;
    const pending = scenes
      .flatMap((scene) => scene.assets)
      .filter(
        (asset) =>
          asset.durationSec == null &&
          asset.type !== "IMAGE" &&
          asset.url?.startsWith(prefix),
      );

    for (const asset of pending) {
      const filename = asset.url!.slice(prefix.length);
      const durationSec = await probeDurationSec(
        join(process.cwd(), UPLOAD_DIR, filename),
      );
      if (durationSec == null) continue;

      asset.durationSec = durationSec;
      await this.prisma.asset.update({
        where: { id: asset.id },
        data: { durationSec },
      });
    }
  }

  async create(userId: string, projectId: string, dto: CreateSceneDto) {
    await this.projects.assertOwned(userId, projectId);

    const order = dto.order ?? (await this.nextOrder(projectId));

    const scene = await this.prisma.scene.create({
      data: {
        projectId,
        order,
        title: dto.title,
        voiceText: dto.voiceText,
        imagePrompt: dto.imagePrompt ?? null,
        videoPrompt: dto.videoPrompt ?? null,
        durationSec: dto.durationSec ?? null,
      },
      include: WITH_ASSETS,
    });

    await this.projects.advanceStatus(projectId, "STORYBOARDING");
    return scene;
  }

  async update(userId: string, sceneId: string, dto: UpdateSceneDto) {
    await this.assertSceneOwned(userId, sceneId);

    // Voiceover меняется — длительность пересчитывается по новому тексту,
    // если только вызывающий не передал durationSec явно сам.
    const durationSec =
      dto.durationSec !== undefined
        ? dto.durationSec
        : dto.voiceText !== undefined
          ? Math.max(MIN_SCENE_SECONDS, estimateSeconds(countWords(dto.voiceText)))
          : undefined;

    return this.prisma.scene.update({
      where: { id: sceneId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.voiceText !== undefined ? { voiceText: dto.voiceText } : {}),
        ...(dto.imagePrompt !== undefined
          ? { imagePrompt: dto.imagePrompt }
          : {}),
        ...(dto.videoPrompt !== undefined
          ? { videoPrompt: dto.videoPrompt }
          : {}),
        ...(durationSec !== undefined ? { durationSec } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
      include: WITH_ASSETS,
    });
  }

  /** Какой из вариантов ассета (кадр/клип/голос/музыка) показывать в canvas и на таймлайне. */
  async setActiveAsset(
    userId: string,
    sceneId: string,
    dto: SetActiveAssetDto,
  ) {
    await this.assertSceneOwned(userId, sceneId);
    const field = ACTIVE_ASSET_FIELD_BY_TYPE[dto.type];

    const asset = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
    });
    if (!asset || asset.sceneId !== sceneId || asset.type !== dto.type) {
      throw new BadRequestException("Asset does not belong to this scene/type");
    }

    return this.prisma.scene.update({
      where: { id: sceneId },
      data: { [field]: dto.assetId },
      include: WITH_ASSETS,
    });
  }

  /**
   * Пересобирает промпты по текущей начитке — для случая, когда текст
   * сцены переписали, а промпты остались от прошлой версии.
   */
  async regeneratePrompts(userId: string, sceneId: string) {
    await this.assertSceneOwned(userId, sceneId);

    const scene = await this.prisma.scene.findUnique({
      where: { id: sceneId },
      select: { voiceText: true },
    });
    if (!scene) throw new NotFoundException("Scene not found");
    if (!scene.voiceText.trim()) {
      throw new BadRequestException("Scene has no voiceover to work from");
    }

    const prompts = await this.llm.promptsFor(scene.voiceText);

    return this.prisma.scene.update({
      where: { id: sceneId },
      data: {
        imagePrompt: prompts.imagePrompt,
        videoPrompt: prompts.videoPrompt,
      },
      include: WITH_ASSETS,
    });
  }

  /**
   * Копия сцены сразу после оригинала. Ассеты не копируются: они привязаны
   * к конкретной генерации, а дублируют сцену ради текста и промптов.
   */
  async duplicate(userId: string, sceneId: string) {
    const { projectId } = await this.assertSceneOwned(userId, sceneId);

    const source = await this.prisma.scene.findUnique({
      where: { id: sceneId },
    });
    if (!source) throw new NotFoundException("Scene not found");

    const [, copy] = await this.prisma.$transaction([
      this.prisma.scene.updateMany({
        where: { projectId, order: { gt: source.order } },
        data: { order: { increment: 1 } },
      }),
      this.prisma.scene.create({
        data: {
          projectId,
          order: source.order + 1,
          title: `${source.title} copy`.slice(0, 200),
          voiceText: source.voiceText,
          imagePrompt: source.imagePrompt,
          videoPrompt: source.videoPrompt,
          durationSec: source.durationSec,
        },
        include: WITH_ASSETS,
      }),
    ]);

    return copy;
  }

  async remove(userId: string, sceneId: string) {
    await this.assertSceneOwned(userId, sceneId);
    await this.prisma.scene.delete({ where: { id: sceneId } });
    return { id: sceneId };
  }

  /** Перестановка сцен — вся пачка в одной транзакции, иначе порядок может «поехать». */
  async reorder(userId: string, dto: ReorderScenesDto) {
    const ids = dto.items.map((i) => i.sceneId);

    const scenes = await this.prisma.scene.findMany({
      where: { id: { in: ids } },
      select: { id: true, projectId: true },
    });

    if (scenes.length !== ids.length) {
      throw new NotFoundException("Some scenes were not found");
    }

    const projectIds = new Set(scenes.map((s) => s.projectId));
    if (projectIds.size !== 1) {
      throw new ForbiddenException("Scenes must belong to a single project");
    }

    const projectId = scenes[0].projectId;
    await this.projects.assertOwned(userId, projectId);

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.scene.update({
          where: { id: item.sceneId },
          data: { order: item.newOrder },
        }),
      ),
    );

    return this.prisma.scene.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
      include: WITH_ASSETS,
    });
  }

  /**
   * Импорт раскадровки, собранной во внешнем чате. Как и split-into-scenes,
   * пересобирает раскадровку целиком — старые сцены с ассетами удаляются
   * в той же транзакции (предупреждение показывает фронт до отправки).
   */
  async importStoryboard(
    userId: string,
    projectId: string,
    dto: ImportStoryboardDto,
  ) {
    await this.projects.assertOwned(userId, projectId);

    const storyboard = parseStoryboard(dto.raw);

    // Нумерацию модели не доверяем: она бывает с пропусками и дублями.
    // Сортируем по её порядку, но в базу кладём плотную 0-based последовательность.
    const ordered = storyboard.scenes
      .map((scene, index) => ({ scene, key: scene.order ?? index + 1, index }))
      .sort((a, b) => a.key - b.key || a.index - b.index)
      .map(({ scene }) => scene);

    await this.prisma.$transaction([
      this.prisma.scene.deleteMany({ where: { projectId } }),
      this.prisma.scene.createMany({
        data: ordered.map((scene, index) => ({
          projectId,
          order: index,
          title: scene.title,
          voiceText: scene.voiceText,
          imagePrompt: scene.imagePrompt || null,
          videoPrompt: scene.videoPrompt || null,
          durationSec: sceneSeconds(scene),
        })),
      }),
    ]);

    await this.applyImportedTitle(projectId, storyboard.projectTitle);
    await this.projects.advanceStatus(projectId, "STORYBOARDING");

    return this.prisma.scene.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
      include: WITH_ASSETS,
    });
  }

  /** Название из JSON не затирает то, что человек ввёл руками. */
  private async applyImportedTitle(projectId: string, title?: string) {
    if (!title) return;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { title: true },
    });
    if (!project || !hasDefaultTitle(project.title)) return;

    await this.prisma.project.update({
      where: { id: projectId },
      data: { title },
    });
  }

  /** Сцена не имеет userId — владение проверяется через её проект. */
  async assertSceneOwned(userId: string, sceneId: string) {
    const scene = await this.prisma.scene.findUnique({
      where: { id: sceneId },
      select: { id: true, projectId: true },
    });
    if (!scene) throw new NotFoundException("Scene not found");
    await this.projects.assertOwned(userId, scene.projectId);
    return scene;
  }

  private async nextOrder(projectId: string): Promise<number> {
    const last = await this.prisma.scene.findFirst({
      where: { projectId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    return last ? last.order + 1 : 0;
  }
}

/**
 * Разбор вставленного ответа модели. Ошибки формулируются под человека:
 * он видит их в модалке импорта и должен понять, что переспросить у чата.
 */
function parseStoryboard(raw: string): StoryboardImport {
  let json: unknown;

  try {
    json = JSON.parse(extractJson(raw));
  } catch {
    throw new BadRequestException(
      "That isn't valid JSON. Paste the model's reply in full, without any of your own text.",
    );
  }

  const result = StoryboardImportSchema.safeParse(json);
  if (!result.success) {
    throw new BadRequestException({
      message:
        "The JSON parsed, but its shape is wrong. Every scene needs a title and voiceText.",
      issues: result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  return result.data;
}
