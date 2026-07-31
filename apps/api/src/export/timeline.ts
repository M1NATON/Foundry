import { basename } from "node:path";

/**
 * Обмен таймлайном с монтажками. Один источник правды — список кусков
 * (TimelineClip), из него собираются и FCPXML (DaVinci Resolve, Premiere,
 * Final Cut), и EDL (читают вообще все, включая старые сборки).
 */

/** Кадров в секунду в экспортируемом таймлайне. */
export const EXPORT_FPS = 30;

export interface TimelineClip {
  /** Номер сцены, 1-based — попадает в имена и комментарии. */
  order: number;
  name: string;
  /** Начало на таймлайне и длительность, целые кадры. */
  startFrames: number;
  durationFrames: number;
  /** Абсолютный путь к файлу картинки/клипа, если он есть. */
  videoPath: string | null;
  /** Абсолютный путь к файлу озвучки, если он есть. */
  audioPath: string | null;
}

export function secondsToFrames(seconds: number): number {
  return Math.max(1, Math.round(seconds * EXPORT_FPS));
}

/**
 * Время в FCPXML — рациональная дробь кадров, а не десятичные секунды:
 * значение вида "1.23s" монтажка отвергает как «not on edit frame boundary».
 */
function rational(frames: number): string {
  return `${frames * 100}/${EXPORT_FPS * 100}s`;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** file:// URL для локального пути: монтажка ищет медиа по нему. */
function fileUrl(absolutePath: string): string {
  return `file://${absolutePath.split("/").map(encodeURIComponent).join("/")}`;
}

/**
 * FCPXML 1.9 — формат, который импортируют DaVinci Resolve (File → Import →
 * Timeline), Premiere и Final Cut. Картинки идут отдельным ресурсом без
 * frameDuration: у неподвижного кадра его быть не должно, иначе Resolve
 * спотыкается на границах кадров.
 */
export function toFcpxml(
  projectTitle: string,
  clips: TimelineClip[],
): string {
  const format = `<format id="r0" name="FFVideoFormat1080p${EXPORT_FPS}" frameDuration="${rational(1)}" width="1920" height="1080" colorSpace="1-1-1 (Rec. 709)"/>`;

  const resources: string[] = [format];
  const spine: string[] = [];
  let nextId = 1;

  for (const clip of clips) {
    const label = xmlEscape(`${String(clip.order).padStart(2, "0")} ${clip.name}`);
    const duration = rational(clip.durationFrames);
    const offset = rational(clip.startFrames);

    if (clip.videoPath) {
      const id = `r${nextId++}`;
      const isImage = isStillImage(clip.videoPath);
      resources.push(
        `<asset id="${id}" name="${xmlEscape(basename(clip.videoPath))}" start="0s" ` +
          `duration="${isImage ? "0s" : duration}" hasVideo="1" videoSources="1"` +
          `${isImage ? "" : ` format="r0"`}>` +
          `<media-rep kind="original-media" src="${fileUrl(clip.videoPath)}"/></asset>`,
      );
      spine.push(
        `<asset-clip ref="${id}" name="${label}" offset="${offset}" duration="${duration}" start="0s"/>`,
      );
    } else {
      // Сцена без картинки не выпадает из таймлайна — на её месте пустой
      // промежуток, иначе последующие сцены съедут по времени.
      spine.push(`<gap name="${label}" offset="${offset}" duration="${duration}"/>`);
    }

    if (clip.audioPath) {
      const id = `r${nextId++}`;
      resources.push(
        `<asset id="${id}" name="${xmlEscape(basename(clip.audioPath))}" start="0s" ` +
          `duration="${duration}" hasAudio="1" audioSources="1" audioChannels="2">` +
          `<media-rep kind="original-media" src="${fileUrl(clip.audioPath)}"/></asset>`,
      );
      spine.push(
        `<asset-clip ref="${id}" name="${label} voice" lane="-1" offset="${offset}" duration="${duration}" start="0s" audioRole="dialogue"/>`,
      );
    }
  }

  const total = clips.reduce((sum, c) => sum + c.durationFrames, 0);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<!DOCTYPE fcpxml>",
    '<fcpxml version="1.9">',
    `  <resources>${resources.join("")}</resources>`,
    "  <library>",
    `    <event name="${xmlEscape(projectTitle)}">`,
    `      <project name="${xmlEscape(projectTitle)}">`,
    `        <sequence format="r0" tcStart="0s" tcFormat="NDF" duration="${rational(total)}" audioLayout="stereo" audioRate="48k">`,
    `          <spine>${spine.join("")}</spine>`,
    "        </sequence>",
    "      </project>",
    "    </event>",
    "  </library>",
    "</fcpxml>",
    "",
  ].join("\n");
}

const STILL_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function isStillImage(path: string): boolean {
  const dot = path.lastIndexOf(".");
  return dot === -1 ? false : STILL_EXT.has(path.slice(dot).toLowerCase());
}

/** Таймкод CMX3600: HH:MM:SS:FF. */
export function timecode(frames: number): string {
  const f = Math.max(0, Math.round(frames));
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    pad(Math.floor(f / (3600 * EXPORT_FPS))),
    pad(Math.floor(f / (60 * EXPORT_FPS)) % 60),
    pad(Math.floor(f / EXPORT_FPS) % 60),
    pad(f % EXPORT_FPS),
  ].join(":");
}

/**
 * EDL (CMX3600) — текстовый формат-страховка: одна видеодорожка, только
 * склейки. Имена файлов идут в комментариях FROM CLIP NAME, потому что
 * само поле reel ограничено восемью символами.
 */
export function toEdl(projectTitle: string, clips: TimelineClip[]): string {
  const lines = [`TITLE: ${projectTitle}`, "FCM: NON-DROP FRAME", ""];

  clips.forEach((clip, index) => {
    const event = String(index + 1).padStart(3, "0");
    const recIn = timecode(clip.startFrames);
    const recOut = timecode(clip.startFrames + clip.durationFrames);
    const srcOut = timecode(clip.durationFrames);

    lines.push(
      `${event}  AX       V     C        00:00:00:00 ${srcOut} ${recIn} ${recOut}`,
      `* FROM CLIP NAME: ${clip.videoPath ? basename(clip.videoPath) : "BLACK"}`,
      `* SCENE ${String(clip.order).padStart(2, "0")}: ${clip.name}`,
      "",
    );
  });

  return lines.join("\n");
}
