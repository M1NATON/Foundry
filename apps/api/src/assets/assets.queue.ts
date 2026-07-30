import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";

export const ASSET_QUEUE = "asset-generation";

export interface AssetJobData {
  assetId: string;
}

export function redisConnection() {
  return {
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
    maxRetriesPerRequest: null,
  };
}

@Injectable()
export class AssetsQueue implements OnModuleDestroy {
  private readonly logger = new Logger(AssetsQueue.name);
  private readonly queue = new Queue<AssetJobData>(ASSET_QUEUE, {
    connection: redisConnection(),
    defaultJobOptions: {
      attempts: 1,
      removeOnComplete: 50,
      removeOnFail: 50,
    },
  });

  async enqueue(assetId: string) {
    await this.queue.add("generate", { assetId });
    this.logger.log(`Queued asset ${assetId}`);
  }

  async onModuleDestroy() {
    await this.queue.close();
  }
}
