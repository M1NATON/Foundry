import { BadRequestException, Injectable } from "@nestjs/common";
import {
  countWords,
  estimateSeconds,
  type UpsertScriptDto,
} from "@foundry/shared-types";
import { PrismaService } from "../prisma/prisma.service";
import { ProjectsService } from "../projects/projects.service";
import { LlmService } from "../llm/llm.service";

@Injectable()
export class ScriptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly llm: LlmService,
  ) {}

  /** Скрипт может ещё не существовать — отдаём пустой дефолт, а не 404. */
  async findOne(userId: string, projectId: string) {
    await this.projects.assertOwned(userId, projectId);

    const script = await this.prisma.script.findUnique({
      where: { projectId },
    });
    if (!script) {
      return { projectId, content: "", wordCount: 0, estSeconds: 0 };
    }
    return script;
  }

  async upsert(userId: string, projectId: string, dto: UpsertScriptDto) {
    await this.projects.assertOwned(userId, projectId);

    // Метрики считаются только на сервере — клиенту им доверять нельзя.
    const wordCount = countWords(dto.content);
    const estSeconds = estimateSeconds(wordCount);

    const script = await this.prisma.script.upsert({
      where: { projectId },
      create: { projectId, content: dto.content, wordCount, estSeconds },
      update: { content: dto.content, wordCount, estSeconds },
    });

    await this.projects.advanceStatus(projectId, "SCRIPTING");

    return script;
  }

  async splitIntoScenes(userId: string, projectId: string) {
    await this.projects.assertOwned(userId, projectId);

    const script = await this.prisma.script.findUnique({
      where: { projectId },
      select: { content: true },
    });
    if (!script || !script.content.trim()) {
      throw new BadRequestException("Script is empty");
    }

    const scenes = await this.llm.splitIntoScenes(script.content);

    // Раскадровка пересобирается целиком: старые сцены (и их ассеты по каскаду)
    // удаляются в той же транзакции, что и вставка новых.
    await this.prisma.$transaction([
      this.prisma.scene.deleteMany({ where: { projectId } }),
      this.prisma.scene.createMany({
        data: scenes.map((scene, index) => ({
          projectId,
          order: index,
          title: scene.title,
          voiceText: scene.voiceText,
          imagePrompt: scene.imagePrompt,
          videoPrompt: scene.videoPrompt,
          durationSec: scene.durationSec,
        })),
      }),
    ]);

    await this.projects.advanceStatus(projectId, "STORYBOARDING");

    return this.prisma.scene.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
      include: { assets: { orderBy: { createdAt: "desc" } } },
    });
  }
}
