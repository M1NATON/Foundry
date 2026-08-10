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
  /**
   * Подсказка движения камеры/объекта (из videoPrompt сцены). Уезжает
   * маркером на клип, чтобы в монтажке было видно задумку без открытия Foundry.
   */
  note: string | null;
}

/**
 * Кусок музыкальной дорожки. Музыка не нарезана по сценам: базовый трек идёт
 * сквозь весь ролик, а сцена со своим треком вырезает из него свой отрезок —
 * поэтому у сегмента есть и позиция на таймлайне, и точка входа в файл.
 */
export interface MusicSegment {
  path: string;
  startFrames: number;
  durationFrames: number;
  /** Смещение внутри исходного файла — у базового трека равно позиции. */
  sourceStartFrames: number;
  name: string;
}

export interface FcpxmlOptions {
  /** Размер кадра таймлайна. По умолчанию Full HD landscape (1920x1080). */
  width?: number;
  height?: number;
  /**
   * Длительность Cross Dissolve между соседними сценами в кадрах.
   * 0 — без переходов. По умолчанию 12 кадров (0.4 с при 30 fps): ровно то,
   * что монтажёр ставит руками через Ctrl+T, только уже в файле.
   */
  transitionFrames?: number;
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

/**
 * file:// URL для пути к медиа: монтажка ищет файлы по нему.
 *
 * Путь сначала нормализуется: обратные слеши Windows (`C:\Users\...`)
 * превращаются в прямые, иначе encodeURIComponent запечатает их как %5C и
 * Resolve покажет все клипы офлайн. Путь, начинающийся с "./", остаётся
 * относительным — так Resolve pack ссылается на свою папку media/.
 */
export function fileUrl(path: string): string {
  const normalized = path.replaceAll("\\", "/");
  const relative = normalized.startsWith("./");
  const segments = normalized
    .split("/")
    .filter((segment) => segment !== "" && segment !== ".")
    .map((segment, index) =>
      // Двоеточие в букве диска Windows (C:) — часть пути, а не URL-синтаксис.
      index === 0 && /^[A-Za-z]:$/.test(segment)
        ? segment
        : encodeURIComponent(segment),
    )
    .join("/");
  return relative ? `file://./${segments}` : `file:///${segments}`;
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
  music: MusicSegment[] = [],
  options: FcpxmlOptions = {},
): string {
  const width = options.width ?? 1920;
  const height = options.height ?? 1080;
  const transitionFrames = options.transitionFrames ?? 12;
  const format = `<format id="r0" name="FFVideoFormat${width}x${height}p${EXPORT_FPS}" frameDuration="${rational(1)}" width="${width}" height="${height}" colorSpace="1-1-1 (Rec. 709)"/>`;

  const resources: string[] = [format];
  const spine: string[] = [];
  let nextId = 1;
  // Последний видеоклип в основной дорожке — переход ставится только на стык
  // двух картинок, gap и аудио-лейны цепочку разрывают.
  let prevVideo: { endFrames: number; durationFrames: number } | null = null;

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

      // Cross Dissolve на стык с предыдущей картинкой. FCPXML ставит переход
      // симметрично на границу: offset = стык минус половина длительности.
      if (
        transitionFrames > 0 &&
        prevVideo &&
        prevVideo.endFrames === clip.startFrames &&
        prevVideo.durationFrames > transitionFrames &&
        clip.durationFrames > transitionFrames
      ) {
        spine.push(
          `<transition name="Cross Dissolve" ` +
            `offset="${rational(clip.startFrames - transitionFrames / 2)}" ` +
            `duration="${rational(transitionFrames)}"/>`,
        );
      }

      // Маркер с подсказкой движения — в Resolve виден прямо на клипе.
      const marker = clip.note
        ? `<marker start="0s" duration="${rational(1)}" ` +
          `value="${xmlEscape(`Motion: ${clip.note}`)}"/>`
        : null;

      spine.push(
        marker
          ? `<asset-clip ref="${id}" name="${label}" offset="${offset}" duration="${duration}" start="0s">${marker}</asset-clip>`
          : `<asset-clip ref="${id}" name="${label}" offset="${offset}" duration="${duration}" start="0s"/>`,
      );
      prevVideo = {
        endFrames: clip.startFrames + clip.durationFrames,
        durationFrames: clip.durationFrames,
      };
    } else {
      // Сцена без картинки не выпадает из таймлайна — на её месте пустой
      // промежуток, иначе последующие сцены съедут по времени.
      spine.push(`<gap name="${label}" offset="${offset}" duration="${duration}"/>`);
      prevVideo = null;
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

  // Музыка идёт своей дорожкой (lane -2), под голосом: она не принадлежит
  // ни одной сцене и режется только там, где сцена перебивает её своей.
  for (const segment of music) {
    const id = `r${nextId++}`;
    const duration = rational(segment.durationFrames);

    resources.push(
      `<asset id="${id}" name="${xmlEscape(basename(segment.path))}" start="0s" ` +
        `duration="${rational(segment.sourceStartFrames + segment.durationFrames)}" ` +
        `hasAudio="1" audioSources="1" audioChannels="2">` +
        `<media-rep kind="original-media" src="${fileUrl(segment.path)}"/></asset>`,
    );
    spine.push(
      `<asset-clip ref="${id}" name="${xmlEscape(segment.name)}" lane="-2" ` +
        `offset="${rational(segment.startFrames)}" duration="${duration}" ` +
        `start="${rational(segment.sourceStartFrames)}" audioRole="music"/>`,
    );
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
export function toEdl(
  projectTitle: string,
  clips: TimelineClip[],
  music: MusicSegment[] = [],
): string {
  const lines = [`TITLE: ${projectTitle}`, "FCM: NON-DROP FRAME", ""];
  let event = 0;
  const next = () => String(++event).padStart(3, "0");

  clips.forEach((clip) => {
    const recIn = timecode(clip.startFrames);
    const recOut = timecode(clip.startFrames + clip.durationFrames);
    const srcOut = timecode(clip.durationFrames);

    lines.push(
      `${next()}  AX       V     C        00:00:00:00 ${srcOut} ${recIn} ${recOut}`,
      `* FROM CLIP NAME: ${clip.videoPath ? basename(clip.videoPath) : "BLACK"}`,
      `* SCENE ${String(clip.order).padStart(2, "0")}: ${clip.name}`,
      "",
    );
  });

  // Музыка отдельными аудио-событиями: EDL не знает про дорожки-слои, но
  // канал A монтажка кладёт на свою звуковую линию.
  music.forEach((segment) => {
    const srcIn = timecode(segment.sourceStartFrames);
    const srcOut = timecode(segment.sourceStartFrames + segment.durationFrames);
    const recIn = timecode(segment.startFrames);
    const recOut = timecode(segment.startFrames + segment.durationFrames);

    lines.push(
      `${next()}  AX       A     C        ${srcIn} ${srcOut} ${recIn} ${recOut}`,
      `* FROM CLIP NAME: ${basename(segment.path)}`,
      `* MUSIC: ${segment.name}`,
      "",
    );
  });

  return lines.join("\n");
}
