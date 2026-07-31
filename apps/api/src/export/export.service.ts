import { join } from "node:path";
import { Injectable } from "@nestjs/common";
import {
  ACTIVE_ASSET_FIELD_BY_TYPE,
  EXPORT_FORMATS,
  estimateSpeechSeconds,
  formatDuration,
  type AssetType,
  type ExportFormat,
} from "@foundry/shared-types";
import { UPLOAD_DIR } from "../assets/upload";
import { ProjectsService } from "../projects/projects.service";
import {
  secondsToFrames,
  toEdl,
  toFcpxml,
  type TimelineClip,
} from "./timeline";

type ProjectPayload = Awaited<ReturnType<ProjectsService["findOne"]>>;
type ScenePayload = ProjectPayload["scenes"][number];

export interface ExportResult {
  filename: string;
  mime: string;
  content: string;
}

/** Минимальная длительность субтитра — иначе короткие сцены мелькают. */
const MIN_SCENE_SECONDS = 2;

@Injectable()
export class ExportService {
  constructor(private readonly projects: ProjectsService) {}

  async export(
    userId: string,
    projectId: string,
    format: ExportFormat,
  ): Promise<ExportResult> {
    const project = await this.projects.findOne(userId, projectId);
    const spec = EXPORT_FORMATS.find((f) => f.format === format)!;

    const content =
      format === "md"
        ? this.toMarkdown(project)
        : format === "txt"
          ? this.toText(project)
          : format === "json"
            ? JSON.stringify(project, null, 2)
            : format === "csv"
              ? this.toCsv(project)
              : format === "prompts"
                ? this.toPrompts(project)
                : format === "fcpxml"
                  ? toFcpxml(project.title, this.toClips(project))
                  : format === "edl"
                    ? toEdl(project.title, this.toClips(project))
                    : this.toSrt(project);

    return {
      filename: `${this.slug(project.title)}.${spec.ext}`,
      mime: spec.mime,
      content,
    };
  }

  /**
   * Сцены проекта в куски таймлайна. Монтажка ищет медиа на диске, поэтому
   * в экспорт идут абсолютные пути к файлам в uploads; сгенерированные
   * заглушки живут в data-URL и файлом не являются — их пропускаем.
   */
  private toClips(project: ProjectPayload): TimelineClip[] {
    let cursor = 0;

    return project.scenes.map((scene) => {
      const durationFrames = secondsToFrames(this.sceneSeconds(scene));
      const startFrames = cursor;
      cursor += durationFrames;

      return {
        order: scene.order + 1,
        name: scene.title,
        startFrames,
        durationFrames,
        videoPath:
          this.activeFilePath(scene, "VIDEO") ??
          this.activeFilePath(scene, "IMAGE"),
        audioPath: this.activeFilePath(scene, "VOICE"),
      };
    });
  }

  /** Путь к файлу активного ассета сцены заданного типа, если он на диске. */
  private activeFilePath(scene: ScenePayload, type: AssetType): string | null {
    const activeId = scene[ACTIVE_ASSET_FIELD_BY_TYPE[type]];
    const asset = scene.assets.find((a) => a.id === activeId);
    if (!asset || asset.status !== "READY" || !asset.url) return null;

    const prefix = `/api/${UPLOAD_DIR}/`;
    if (!asset.url.startsWith(prefix)) return null;

    return join(process.cwd(), UPLOAD_DIR, asset.url.slice(prefix.length));
  }

  private toMarkdown(project: ProjectPayload): string {
    const lines: string[] = [`# ${project.title}`, ""];

    const meta = [
      `${project.scenes.length} scene${project.scenes.length === 1 ? "" : "s"}`,
      `${(project.script?.wordCount ?? 0).toLocaleString()} words`,
      formatDuration(project.script?.estSeconds ?? 0),
    ];
    lines.push(`_${meta.join(" · ")}_`, "");

    if (project.script?.content) {
      lines.push("## Script", "", project.script.content, "");
    }

    if (project.scenes.length > 0) {
      lines.push("## Scenes", "");
      for (const scene of project.scenes) {
        lines.push(`### ${scene.order + 1}. ${scene.title}`, "");
        if (scene.durationSec != null) {
          lines.push(`**Duration:** ${formatDuration(scene.durationSec)}`, "");
        }
        lines.push("**Voiceover**", "", scene.voiceText, "");
        if (scene.imagePrompt) {
          lines.push("**Image prompt**", "", scene.imagePrompt, "");
        }
        if (scene.videoPrompt) {
          lines.push("**Video prompt**", "", scene.videoPrompt, "");
        }
        if (scene.assets.length > 0) {
          lines.push("**Assets**", "");
          for (const asset of scene.assets) {
            lines.push(`- ${asset.type} — ${asset.status}`);
          }
          lines.push("");
        }
      }
    }

    return lines.join("\n");
  }

  private toText(project: ProjectPayload): string {
    if (project.scenes.length === 0) return project.script?.content ?? "";
    return project.scenes.map((s) => s.voiceText).join("\n\n");
  }

  /**
   * Только промпты, по сцене на блок — чтобы прогнать их пачкой во внешнем
   * генераторе. Сцена без обоих промптов попадает в файл с пометкой, иначе
   * нумерация блоков разъедется с нумерацией сцен.
   */
  private toPrompts(project: ProjectPayload): string {
    return project.scenes
      .map((scene) =>
        [
          `# ${scene.order + 1}. ${scene.title}`,
          `IMAGE: ${scene.imagePrompt?.trim() || "(none)"}`,
          `VIDEO: ${scene.videoPrompt?.trim() || "(none)"}`,
          "",
        ].join("\n"),
      )
      .join("\n");
  }

  private toCsv(project: ProjectPayload): string {
    const header = [
      "order",
      "title",
      "durationSec",
      "status",
      "voiceText",
      "imagePrompt",
      "videoPrompt",
    ];

    const rows = project.scenes.map((scene) =>
      [
        String(scene.order),
        scene.title,
        scene.durationSec != null ? String(scene.durationSec) : "",
        scene.status,
        scene.voiceText,
        scene.imagePrompt ?? "",
        scene.videoPrompt ?? "",
      ]
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(","),
    );

    return [header.join(","), ...rows].join("\n");
  }

  private toSrt(project: ProjectPayload): string {
    let cursor = 0;

    return project.scenes
      .map((scene, i) => {
        const duration = this.sceneSeconds(scene);
        const start = cursor;
        cursor += duration;

        return [
          String(i + 1),
          `${this.timecode(start)} --> ${this.timecode(cursor)}`,
          scene.voiceText,
          "",
        ].join("\n");
      })
      .join("\n");
  }

  /** Явная длительность сцены, иначе оценка по темпу начитки. */
  private sceneSeconds(scene: ScenePayload): number {
    const raw =
      scene.durationSec ?? estimateSpeechSeconds(scene.voiceText);
    return Math.max(MIN_SCENE_SECONDS, raw);
  }

  private timecode(totalSeconds: number): string {
    const ms = Math.round(totalSeconds * 1000);
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1000);
    const millis = ms % 1000;

    const pad = (n: number, size = 2) => String(n).padStart(size, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)},${pad(millis, 3)}`;
  }

  private slug(title: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug || "project";
  }
}
