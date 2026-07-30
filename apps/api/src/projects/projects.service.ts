import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateProjectDto,
  UpdateProjectDto,
} from "@foundry/shared-types";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        userId,
        title: dto.title,
        coverUrl: dto.coverUrl ?? null,
      },
    });
  }

  /** Список для Project Library — с агрегатами для карточки. */
  async findAll(userId: string) {
    const projects = await this.prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        script: { select: { wordCount: true, estSeconds: true } },
        _count: { select: { scenes: true } },
      },
    });

    return projects.map(({ script, _count, ...project }) => ({
      ...project,
      sceneCount: _count.scenes,
      wordCount: script?.wordCount ?? 0,
      estSeconds: script?.estSeconds ?? 0,
    }));
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, userId },
      include: {
        research: true,
        script: true,
        scenes: {
          orderBy: { order: "asc" },
          include: { assets: { orderBy: { createdAt: "desc" } } },
        },
      },
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    await this.assertOwned(userId, id);
    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.coverUrl !== undefined ? { coverUrl: dto.coverUrl } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.assertOwned(userId, id);
    await this.prisma.project.delete({ where: { id } });
    return { id };
  }

  /**
   * Проверка владения — единственная точка авторизации на уровне данных.
   * Все вложенные ресурсы (research/script/scenes/assets) проходят через неё.
   */
  async assertOwned(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true, status: true },
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  /**
   * Продвигает статус проекта вперёд по пайплайну, но никогда не откатывает назад:
   * сохранение скрипта не должно сбрасывать проект из PRODUCING в SCRIPTING.
   */
  async advanceStatus(
    projectId: string,
    target: "RESEARCH" | "SCRIPTING" | "STORYBOARDING" | "PRODUCING" | "READY",
  ) {
    const ORDER = [
      "DRAFT",
      "RESEARCH",
      "SCRIPTING",
      "STORYBOARDING",
      "PRODUCING",
      "READY",
    ] as const;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { status: true },
    });
    if (!project) return;

    if (ORDER.indexOf(project.status) >= ORDER.indexOf(target)) return;

    await this.prisma.project.update({
      where: { id: projectId },
      data: { status: target },
    });
  }
}
