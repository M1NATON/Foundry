import { basename } from "node:path";
import {
  EXPORT_FPS,
  fileUrl,
  type FcpxmlOptions,
  type MusicSegment,
  type TimelineClip,
} from "./timeline";

/**
 * FCP 7 XML (xmeml v4) — формат, который Premiere Pro импортирует нативно
 * (File → Import). Premiere не понимает FCPXML от Final Cut Pro X, поэтому
 * для него собираем старый формат из того же списка TimelineClip. Переходы
 * сюда не кладём: Premiere надёжнее ставит default transition руками, чем
 * переваривает чужие transitionitem.
 */

function rate(): string {
  return `<rate><timebase>${EXPORT_FPS}</timebase><ntsc>FALSE</ntsc></rate>`;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Маркер с подсказкой движения — Premiere показывает его как clip marker. */
function markerXml(note: string | null): string {
  if (!note) return "";
  const text = xmlEscape(`Motion: ${note}`);
  return `<marker><comment>${text}</comment><name>${text}</name><in>0</in><out>1</out></marker>`;
}

function videoFileXml(id: string, path: string, durationFrames: number, width: number, height: number): string {
  return (
    `<file id="${id}"><name>${xmlEscape(basename(path))}</name>` +
    `<pathurl>${xmlEscape(fileUrl(path))}</pathurl>${rate()}` +
    `<duration>${durationFrames}</duration>` +
    `<media><video><samplecharacteristics>${rate()}<width>${width}</width><height>${height}</height><pixelaspectratio>square</pixelaspectratio></samplecharacteristics></video></media>` +
    `</file>`
  );
}

function audioFileXml(id: string, path: string, durationFrames: number): string {
  return (
    `<file id="${id}"><name>${xmlEscape(basename(path))}</name>` +
    `<pathurl>${xmlEscape(fileUrl(path))}</pathurl>${rate()}` +
    `<duration>${durationFrames}</duration>` +
    `<media><audio><samplecharacteristics><samplerate>48000</samplerate></samplecharacteristics><channelcount>2</channelcount></audio></media>` +
    `</file>`
  );
}

export function toXmeml(
  projectTitle: string,
  clips: TimelineClip[],
  music: MusicSegment[] = [],
  options: FcpxmlOptions = {},
): string {
  const width = options.width ?? 1920;
  const height = options.height ?? 1080;
  const total = clips.reduce((sum, c) => sum + c.durationFrames, 0);

  const videoItems: string[] = [];
  const voiceItems: string[] = [];
  const musicItems: string[] = [];
  let nextId = 1;

  for (const clip of clips) {
    const label = xmlEscape(`${String(clip.order).padStart(2, "0")} ${clip.name}`);
    const start = clip.startFrames;
    const end = clip.startFrames + clip.durationFrames;

    if (clip.videoPath) {
      const fileId = `file-${nextId++}`;
      videoItems.push(
        `<clipitem id="clipitem-${nextId++}">` +
          `<name>${label}</name><enabled>TRUE</enabled>` +
          `<duration>${clip.durationFrames}</duration>${rate()}` +
          `<start>${start}</start><end>${end}</end>` +
          `<in>0</in><out>${clip.durationFrames}</out>` +
          videoFileXml(fileId, clip.videoPath, clip.durationFrames, width, height) +
          markerXml(clip.note) +
          `</clipitem>`,
      );
    }
    // Сцена без картинки — просто дыра на таймлайне: start/end следующих
    // клипов абсолютные, ничего сдвигать не нужно.

    if (clip.audioPath) {
      const fileId = `file-${nextId++}`;
      voiceItems.push(
        `<clipitem id="clipitem-${nextId++}">` +
          `<name>${label} voice</name><enabled>TRUE</enabled>` +
          `<duration>${clip.durationFrames}</duration>${rate()}` +
          `<start>${start}</start><end>${end}</end>` +
          `<in>0</in><out>${clip.durationFrames}</out>` +
          `<sourcetrack><mediatype>audio</mediatype><trackindex>1</trackindex></sourcetrack>` +
          audioFileXml(fileId, clip.audioPath, clip.durationFrames) +
          `</clipitem>`,
      );
    }
  }

  for (const segment of music) {
    const fileId = `file-${nextId++}`;
    const inF = segment.sourceStartFrames;
    const outF = segment.sourceStartFrames + segment.durationFrames;
    musicItems.push(
      `<clipitem id="clipitem-${nextId++}">` +
        `<name>${xmlEscape(segment.name)}</name><enabled>TRUE</enabled>` +
        `<duration>${segment.durationFrames}</duration>${rate()}` +
        `<start>${segment.startFrames}</start><end>${segment.startFrames + segment.durationFrames}</end>` +
        `<in>${inF}</in><out>${outF}</out>` +
        `<sourcetrack><mediatype>audio</mediatype><trackindex>1</trackindex></sourcetrack>` +
        audioFileXml(fileId, segment.path, outF) +
        `</clipitem>`,
    );
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<!DOCTYPE xmeml>",
    `<xmeml version="4">`,
    `  <sequence id="sequence-1">`,
    `    <name>${xmlEscape(projectTitle)}</name>`,
    `    ${rate()}`,
    `    <duration>${total}</duration>`,
    `    <timecode>${rate()}<string>00:00:00:00</string><frame>0</frame><displayformat>NDF</displayformat></timecode>`,
    `    <media>`,
    `      <video>`,
    `        <format><samplecharacteristics>${rate()}<width>${width}</width><height>${height}</height><pixelaspectratio>square</pixelaspectratio></samplecharacteristics></format>`,
    `        <track>${videoItems.join("")}</track>`,
    `      </video>`,
    `      <audio>`,
    `        <numOutputChannels>2</numOutputChannels>`,
    `        <format><samplecharacteristics><samplerate>48000</samplerate><depth>16</depth></samplecharacteristics></format>`,
    `        <track>${voiceItems.join("")}</track>`,
    `        <track>${musicItems.join("")}</track>`,
    `      </audio>`,
    `    </media>`,
    `  </sequence>`,
    `</xmeml>`,
    "",
  ].join("\n");
}
