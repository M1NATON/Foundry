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
    const fallback =
      dto.type === "IMAGE"
        ? scene.imagePrompt
        : dto.type === "VIDEO"
          ? scene.videoPrompt
          : scene.voiceText;

    const prompt = (dto.prompt ?? fallback ?? "").trim();
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
    await this.projects.assertOwned(userId, asset.scene.projectId);

    const { scene: _scene, ...rest } = asset;
    return rest;
  }

  async remove(userId: string, assetId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: { scene: true },
    });
    if (!asset) throw new NotFoundException("Asset not found");
    await this.projects.assertOwned(userId, asset.scene.projectId);

    await this.prisma.asset.delete({ where: { id: assetId } });

    // Удалённый ассет был активным — переносим активность на другой READY-вариант
    // того же типа (самый новый), иначе сбрасываем ссылку.
    const field = ACTIVE_ASSET_FIELD_BY_TYPE[asset.type];
    if (asset.scene[field] === assetId) {
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
}

/**
 * Длина сцены по голосу: округляем вверх, чтобы фраза не обрывалась на
 * стыке, и держим тот же нижний предел, что и оценка по тексту.
 */
export function sceneSecondsFromVoice(voiceDurationSec: number): number {
  return Math.max(MIN_SCENE_SECONDS, Math.ceil(voiceDurationSec));
}
