import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { AssetType, CreateAssetDto } from "@foundry/shared-types";
import { PrismaService } from "../prisma/prisma.service";
import { ProjectsService } from "../projects/projects.service";
import { AssetsQueue } from "./assets.queue";
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

    await this.prisma.scene.update({
      where: { id: sceneId },
      data: { status: "GENERATING" },
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

    const asset = await this.prisma.asset.create({
      data: {
        sceneId,
        type,
        provider: "upload",
        prompt: originalName,
        status: "READY",
        url: `/api/${UPLOAD_DIR}/${filename}`,
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
      include: { scene: { select: { projectId: true } } },
    });
    if (!asset) throw new NotFoundException("Asset not found");
    await this.projects.assertOwned(userId, asset.scene.projectId);

    await this.prisma.asset.delete({ where: { id: assetId } });
    return { id: assetId };
  }
}
