import { extname } from "node:path";
import { BadRequestException } from "@nestjs/common";
import type { AssetType } from "@foundry/shared-types";

export const UPLOAD_DIR = "uploads";
export const UPLOAD_MAX_BYTES = 100 * 1024 * 1024;

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov"]);
const AUDIO_EXT = new Set([".mp3", ".wav", ".ogg", ".m4a", ".flac"]);

const ALLOWED: Record<AssetType, Set<string>> = {
  IMAGE: IMAGE_EXT,
  VIDEO: VIDEO_EXT,
  VOICE: AUDIO_EXT,
  MUSIC: AUDIO_EXT,
};

/** Бросает 400, если расширение не подходит под тип ассета. */
export function assertAllowedFile(originalName: string, type: AssetType): void {
  const ext = extname(originalName).toLowerCase();
  if (!ALLOWED[type].has(ext)) {
    throw new BadRequestException(
      `File type "${ext || "unknown"}" is not allowed for ${type}`,
    );
  }
}
