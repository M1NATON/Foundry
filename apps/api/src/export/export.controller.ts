import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import {
  ExportRequestSchema,
  type ExportRequestDto,
} from "@foundry/shared-types";
import { AuthGuard } from "../common/auth.guard";
import { UserId } from "../common/user-id.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { ExportService } from "./export.service";

@Controller("projects/:projectId/export")
@UseGuards(AuthGuard)
export class ExportController {
  constructor(private readonly exporter: ExportService) {}

  @Post()
  export(
    @UserId() userId: string,
    @Param("projectId") projectId: string,
    @Body(new ZodValidationPipe(ExportRequestSchema)) dto: ExportRequestDto,
  ) {
    return this.exporter.export(userId, projectId, dto.format);
  }
}
