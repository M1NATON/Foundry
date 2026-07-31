import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { Worker } from "bullmq";
import type { AssetType } from "@foundry/shared-types";
import { PrismaService } from "../prisma/prisma.service";
import {
  ASSET_QUEUE,
  redisConnection,
  type AssetJobData,
} from "./assets.queue";
import { placeholderAsset } from "./placeholder";

/**
 * Воркер живёт в том же процессе, что и API — для MVP этого достаточно.
 * Вынести в отдельный сервис можно будет, не меняя ничего, кроме точки старта.
 */
@Injectable()
export class AssetsProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AssetsProcessor.name);
  private worker?: Worker<AssetJobData>;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.worker = new Worker<AssetJobData>(
      ASSET_QUEUE,
      async (job) => this.process(job.data.assetId),
      { connection: redisConnection(), concurrency: 2 },
    );

    this.worker.on("failed", (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }

  private async process(assetId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });
    if (!asset) return;

    // Музыка проекта не привязана к сцене — двигать там нечего.
    const sceneId = asset.sceneId;

    await this.prisma.asset.update({
      where: { id: assetId },
      data: { status: "GENERATING" },
    });
    if (sceneId) {
      await this.prisma.scene.update({
        where: { id: sceneId },
        data: { status: "GENERATING" },
      });
    }

    try {
      const url = await this.generate(asset.type, asset.prompt);

      await this.prisma.asset.update({
        where: { id: assetId },
        data: { status: "READY", url, errorMsg: null },
      });
      if (sceneId) await this.settleScene(sceneId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Generation failed";
      this.logger.error(`Asset ${assetId}: ${message}`);

      await this.prisma.asset.update({
        where: { id: assetId },
        data: { status: "FAILED", errorMsg: message },
      });
      if (sceneId) {
        await this.prisma.scene.update({
          where: { id: sceneId },
          data: { status: "FAILED" },
        });
      }
    }
  }

  /**
   * Сцена переходит в READY только когда не осталось незавершённых ассетов —
   * иначе один быстрый ассет пометил бы сцену готовой раньше времени.
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

  private async generate(type: AssetType, prompt: string): Promise<string> {
    const key = process.env.GEMINI_API_KEY;

    // Видео/аудио-провайдеры ещё не подключены — для них всегда заглушка.
    if (!key || type !== "IMAGE") {
      await new Promise((r) => setTimeout(r, 1200));
      return placeholderAsset(type, prompt);
    }

    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": key,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      );

      if (!res.ok) throw new Error(`Gemini responded ${res.status}`);

      const body = (await res.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }>;
          };
        }>;
      };

      const inline = body.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData?.data,
      )?.inlineData;

      if (!inline?.data) throw new Error("No image in Gemini response");

      return `data:${inline.mimeType ?? "image/png"};base64,${inline.data}`;
    } catch (error) {
      this.logger.warn(
        `Gemini generation failed, falling back to placeholder: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return placeholderAsset(type, prompt);
    }
  }
}
