import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  UpsertScriptSchema,
  type UpsertScriptDto,
} from "@foundry/shared-types";
import { AuthGuard } from "../common/auth.guard";
import { UserId } from "../common/user-id.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { ScriptsService } from "./scripts.service";

@Controller("projects/:projectId/script")
@UseGuards(AuthGuard)
export class ScriptsController {
  constructor(private readonly scripts: ScriptsService) {}

  @Get()
  findOne(@UserId() userId: string, @Param("projectId") projectId: string) {
    return this.scripts.findOne(userId, projectId);
  }

  @Put()
  upsert(
    @UserId() userId: string,
    @Param("projectId") projectId: string,
    @Body(new ZodValidationPipe(UpsertScriptSchema)) dto: UpsertScriptDto,
  ) {
    return this.scripts.upsert(userId, projectId, dto);
  }

  @Post("split-into-scenes")
  splitIntoScenes(
    @UserId() userId: string,
    @Param("projectId") projectId: string,
  ) {
    return this.scripts.splitIntoScenes(userId, projectId);
  }
}
