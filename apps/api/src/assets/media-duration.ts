import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Logger } from "@nestjs/common";

const run = promisify(execFile);
const logger = new Logger("MediaDuration");

/** ffprobe иногда виснет на битом файле — ждать его дольше смысла нет. */
const PROBE_TIMEOUT_MS = 5000;

/**
 * Длительность медиафайла в секундах через ffprobe.
 *
 * ffprobe — необязательная зависимость: если его нет в системе или файл
 * не читается, возвращаем null, и длительность сцены остаётся оценкой по
 * темпу начитки. Падать из-за этого загрузка файла не должна.
 */
export async function probeDurationSec(
  absolutePath: string,
): Promise<number | null> {
  try {
    const { stdout } = await run(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        absolutePath,
      ],
      { timeout: PROBE_TIMEOUT_MS },
    );
    return parseProbeDuration(stdout);
  } catch (error) {
    logger.debug(
      `ffprobe unavailable or failed for ${absolutePath}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return null;
  }
}

/**
 * Разбор вывода ffprobe. Для потоков без известной длительности он печатает
 * "N/A" — это не число и не ошибка, просто «неизвестно».
 */
export function parseProbeDuration(stdout: string): number | null {
  const value = Number.parseFloat(stdout.trim());
  return Number.isFinite(value) && value > 0 ? value : null;
}
