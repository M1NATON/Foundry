import { Body, Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import {
  UpsertResearchSchema,
  type UpsertResearchDto,
} from "@foundry/shared-types";
import { AuthGuard } from "../common/auth.guard";
import { UserId } from "../common/user-id.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { ResearchService } from "./research.service";

@Controller("projects/:projectId/research")
@UseGuards(AuthGuard)
export class ResearchController {
  constructor(private readonly research: ResearchService) {}

  @Get()
  findOne(@UserId() userId: string, @Param("projectId") projectId: string) {
    return this.research.findOne(userId, projectId);
  }

  @Put()
  upsert(
    @UserId() userId: string,
    @Param("projectId") projectId: string,
    @Body(new ZodValidationPipe(UpsertResearchSchema)) dto: UpsertResearchDto,
  ) {
    return this.research.upsert(userId, projectId, dto);
  }
}
