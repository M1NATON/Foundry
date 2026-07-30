import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import {
  SourceSchema,
  type Source,
  type UpsertResearchDto,
} from "@foundry/shared-types";
import { PrismaService } from "../prisma/prisma.service";
import { ProjectsService } from "../projects/projects.service";

@Injectable()
export class ResearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  /** Research может ещё не существовать — отдаём пустой дефолт, а не 404. */
  async findOne(userId: string, projectId: string) {
    await this.projects.assertOwned(userId, projectId);

    const research = await this.prisma.research.findUnique({
      where: { projectId },
    });
    if (!research) {
      return { projectId, sources: [] as Source[], notes: "" };
    }

    return {
      ...research,
      sources: parseSources(research.sources),
      notes: research.notes ?? "",
    };
  }

  async upsert(userId: string, projectId: string, dto: UpsertResearchDto) {
    await this.projects.assertOwned(userId, projectId);

    const sources: Prisma.InputJsonValue = dto.sources;
    const research = await this.prisma.research.upsert({
      where: { projectId },
      create: { projectId, sources, notes: dto.notes },
      update: { sources, notes: dto.notes },
    });

    await this.projects.advanceStatus(projectId, "RESEARCH");

    return {
      ...research,
      sources: parseSources(research.sources),
      notes: research.notes ?? "",
    };
  }
}

/** sources хранится как Json — приводим к чистому типу, битые записи отбрасываем. */
function parseSources(value: Prisma.JsonValue): Source[] {
  const parsed = SourceSchema.array().safeParse(value);
  return parsed.success ? parsed.data : [];
}
