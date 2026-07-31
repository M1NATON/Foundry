import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { join } from "node:path";
import {
  ACTIVE_ASSET_FIELD_BY_TYPE,
  MIN_SCENE_SECONDS,
  type AssetType,
  type CreateAssetDto,
} from "@foundry/shared-types";
import { PrismaService } from "../prisma/prisma.service";
import { ProjectsService } from "../projects/projects.service";
import { AssetsQueue } from "./assets.queue";
import { probeDurationSec } from "./media-duration";
import { UPLOAD_DIR } from "./upload";

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly queue: AssetsQueue,
  ) {}

  async create(userId: string, sceneId: string, dto: CreateAssetDto) {
    const scene = await this.prisma.scene.findUnique({
      where: { id: sceneId },
    });
    if (!scene) throw new NotFoundException("Scene not found");
    await this.projects.assertOwned(userId, scene.projectId);

    // Промпт по умолчанию берётся из соответствующего поля сцены.
    const prompt = (dto.prompt ?? promptFor(scene, dto.type)).trim();
    if (!prompt) {
      throw new BadRequestException(
        `Scene has no prompt for ${dto.type} generation`,
      );
    }

    const asset = await this.prisma.asset.create({
      data: {
        sceneId,
        type: dto.type,
        provider: dto.provider,
        prompt,
        status: "QUEUED",
      },
    });

    // Новый ассет сразу становится активным — без этого пользователю пришлось
    // бы вручную выбирать вариант, даже если он единственный.
    await this.prisma.scene.update({
      where: { id: sceneId },
      data: {
        status: "GENERATING",
        [ACTIVE_ASSET_FIELD_BY_TYPE[dto.type]]: asset.id,
      },
    });
    await this.projects.advanceStatus(scene.projectId, "PRODUCING");
    await this.queue.enqueue(asset.id);

    return asset;
  }

  /**
   * Догенерировать недостающее по всему проекту: для каждой сцены ставим в
   * очередь только те типы, у которых ещё нет активного ассета. Уже готовое
   * (и уже генерирующееся) не трогаем — иначе кнопка перезаписывала бы
   * выбранные вручную варианты.
   */
  async generateMissing(
    userId: string,
    projectId: string,
    types: AssetType[],
  ): Promise<{ queued: number; skipped: number }> {
    await this.projects.assertOwned(userId, projectId);

    const scenes = await this.prisma.scene.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
      include: { assets: { select: { id: true, type: true, status: true } } },
    });

    let queued = 0;
    let skipped = 0;

    for (const scene of scenes) {
      for (const type of types) {
        if (scene[ACTIVE_ASSET_FIELD_BY_TYPE[type]]) continue;

        const busy = scene.assets.some(
          (a) => a.type === type && (a.status === "QUEUED" || a.status === "GENERATING"),
        );
        if (busy) continue;

        const prompt = promptFor(scene, type);
        // Без промпта генерировать нечего — считаем сцену пропущенной,
        // а не роняем весь пакет из-за одной пустой.
        if (!prompt) {
          skipped++;
          continue;
        }

        const asset = await this.prisma.asset.create({
          data: {
            sceneId: scene.id,
            type,
            provider: "gemini",
            prompt,
            status: "QUEUED",
          },
        });
        await this.prisma.scene.update({
          where: { id: scene.id },
          data: {
            status: "GENERATING",
            [ACTIVE_ASSET_FIELD_BY_TYPE[type]]: asset.id,
          },
        });
        await this.queue.enqueue(asset.id);
        queued++;
      }
    }

    if (queued > 0) await this.projects.advanceStatus(projectId, "PRODUCING");
    return { queued, skipped };
  }

  /** Готовый файл, загруженный пользователем: генерация не нужна, статус сразу READY. */
  async attachUpload(
    userId: string,
    sceneId: string,
    type: AssetType,
    filename: string,
    originalName: string,
  ) {
    const scene = await this.prisma.scene.findUnique({
      where: { id: sceneId },
    });
    if (!scene) throw new NotFoundException("Scene not found");
    await this.projects.assertOwned(userId, scene.projectId);

    const durationSec = await probeDurationSec(
      join(process.cwd(), UPLOAD_DIR, filename),
    );

    const asset = await this.prisma.asset.create({
      data: {
        sceneId,
        type,
        provider: "upload",
        prompt: originalName,
        status: "READY",
        url: `/api/${UPLOAD_DIR}/${filename}`,
        durationSec,
      },
    });

    await this.prisma.scene.update({
      where: { id: sceneId },
      data: {
        [ACTIVE_ASSET_FIELD_BY_TYPE[type]]: asset.id,
        // Голос задаёт реальную длину сцены: оценка «150 слов в минуту»
        // нужна только пока начитки нет. Клип и музыка длину не диктуют —
        // их можно подрезать в монтаже.
        ...(type === "VOICE" && durationSec != null
          ? { durationSec: sceneSecondsFromVoice(durationSec) }
          : {}),
      },
    });
    await this.settleScene(sceneId);
    return asset;
  }

  /**
   * Та же семантика, что в AssetsProcessor: сцена READY только когда не
   * осталось незавершённых ассетов; пока что-то генерируется — не трогаем.
   */
  private async settleScene(sceneId: string) {
    const pending = await this.prisma.asset.count({
      where: { sceneId, status: { in: ["QUEUED", "GENERATING"] } },
    });
    if (pending > 0) return;

    const failed = await this.prisma.asset.count({
      where: { sceneId, status: "FAILED" },
    });

    await this.prisma.scene.update({
      where: { id: sceneId },
      data: { status: failed > 0 ? "FAILED" : "READY" },
    });
  }

  /** Роут для поллинга с фронта (каждые 3с, пока QUEUED/GENERATING). */
  async findOne(userId: string, assetId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: { scene: { select: { projectId: true } } },
    });
    if (!asset) throw new NotFoundException("Asset not found");
    await this.projects.assertOwned(userId, owningProjectId(asset));

    const { scene: _scene, ...rest } = asset;
    return rest;
  }

  async remove(userId: string, assetId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: { scene: true, project: { select: { activeMusicId: true } } },
    });
    if (!asset) throw new NotFoundException("Asset not found");
    await this.projects.assertOwned(userId, owningProjectId(asset));

    await this.prisma.asset.delete({ where: { id: assetId } });

    // Удалённый ассет был активным — переносим активность на другой READY-вариант
    // того же типа (самый новый), иначе сбрасываем ссылку.
    if (asset.projectId) {
      if (asset.project?.activeMusicId === assetId) {
        const next = await this.prisma.asset.findFirst({
          where: { projectId: asset.projectId, type: "MUSIC", status: "READY" },
          orderBy: { createdAt: "desc" },
        });
        await this.prisma.project.update({
          where: { id: asset.projectId },
          data: { activeMusicId: next?.id ?? null },
        });
      }
      return { id: assetId };
    }

    const field = ACTIVE_ASSET_FIELD_BY_TYPE[asset.type];
    if (asset.scene && asset.sceneId && asset.scene[field] === assetId) {
      const next = await this.prisma.asset.findFirst({
        where: { sceneId: asset.sceneId, type: asset.type, status: "READY" },
        orderBy: { createdAt: "desc" },
      });
      await this.prisma.scene.update({
        where: { id: asset.sceneId },
        data: { [field]: next?.id ?? null },
      });
    }

    return { id: assetId };
  }

  /** Музыка проекта: выбранный базовый трек и варианты, что лежат рядом. */
  async projectMusic(userId: string, projectId: string) {
    await this.projects.assertOwned(userId, projectId);

    const [project, assets] = await Promise.all([
      this.prisma.project.findUnique({
        where: { id: projectId },
        select: { activeMusicId: true },
      }),
      this.prisma.asset.findMany({
        where: { projectId, type: "MUSIC" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { activeMusicId: project?.activeMusicId ?? null, assets };
  }

  /**
   * Сгенерировать базовый трек. Промпт берётся только из запроса: у проекта
   * нет поля вроде voiceText сцены, из которого его можно было бы вывести.
   */
  async createProjectMusic(
    userId: string,
    projectId: string,
    dto: CreateAssetDto,
  ) {
    await this.projects.assertOwned(userId, projectId);

    const prompt = dto.prompt?.trim();
    if (!prompt) throw new BadRequestException("Music prompt is required");

    const asset = await this.prisma.asset.create({
      data: {
        projectId,
        type: "MUSIC",
        provider: dto.provider,
        prompt,
        status: "QUEUED",
      },
    });

    // Новый трек сразу становится базовым — как и новый ассет сцены.
    await this.prisma.project.update({
      where: { id: projectId },
      data: { activeMusicId: asset.id },
    });
    await this.queue.enqueue(asset.id);

    return asset;
  }

  /** Готовый трек, загруженный пользователем: генерация не нужна. */
  async attachProjectMusicUpload(
    userId: string,
    projectId: string,
    filename: string,
    originalName: string,
  ) {
    await this.projects.assertOwned(userId, projectId);

    const durationSec = await probeDurationSec(
      join(process.cwd(), UPLOAD_DIR, filename),
    );

    const asset = await this.prisma.asset.create({
      data: {
        projectId,
        type: "MUSIC",
        provider: "upload",
        prompt: originalName,
        status: "READY",
        url: `/api/${UPLOAD_DIR}/${filename}`,
        durationSec,
      },
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { activeMusicId: asset.id },
    });

    return asset;
  }

  /** Выбрать базовый трек или снять музыку с проекта совсем (null). */
  async setProjectMusic(
    userId: string,
    projectId: string,
    assetId: string | null,
  ) {
    await this.projects.assertOwned(userId, projectId);

    if (assetId) {
      const exists = await this.prisma.asset.findFirst({
        where: { id: assetId, projectId, type: "MUSIC" },
        select: { id: true },
      });
      if (!exists) throw new NotFoundException("Music asset not found");
    }

    await this.prisma.project.update({
      where: { id: projectId },
      data: { activeMusicId: assetId },
    });

    return this.projectMusic(userId, projectId);
  }
}

/**
 * Длина сцены по голосу: округляем вверх, чтобы фраза не обрывалась на
 * стыке, и держим тот же нижний предел, что и оценка по тексту.
 */
export function sceneSecondsFromVoice(voiceDurationSec: number): number {
  return Math.max(MIN_SCENE_SECONDS, Math.ceil(voiceDurationSec));
}

/**
 * Проект, которому принадлежит ассет: напрямую (базовая музыка) или через
 * свою сцену. Ровно одно из двух полей всегда заполнено.
 */
function owningProjectId(asset: {
  projectId: string | null;
  scene: { projectId: string } | null;
}): string {
  const projectId = asset.projectId ?? asset.scene?.projectId;
  if (!projectId) {
    throw new NotFoundException("Asset is not attached to a project");
  }
  return projectId;
}

/** Поле сцены, из которого берётся промпт для генерации ассета этого типа. */
function promptFor(
  scene: { imagePrompt: string | null; videoPrompt: string | null; voiceText: string },
  type: AssetType,
): string {
  const source =
    type === "IMAGE"
      ? scene.imagePrompt
      : type === "VIDEO"
        ? scene.videoPrompt
        : scene.voiceText;
  return (source ?? "").trim();
}
