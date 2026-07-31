import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  CreateSceneSchema,
  ImportStoryboardSchema,
  ReorderScenesSchema,
  SetActiveAssetSchema,
  UpdateSceneSchema,
  type CreateSceneDto,
  type ImportStoryboardDto,
  type ReorderScenesDto,
  type SetActiveAssetDto,
  type UpdateSceneDto,
} from "@foundry/shared-types";
import { AuthGuard } from "../common/auth.guard";
import { UserId } from "../common/user-id.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { ScenesService } from "./scenes.service";

@Controller("projects/:projectId/scenes")
@UseGuards(AuthGuard)
export class ProjectScenesController {
  constructor(private readonly scenes: ScenesService) {}

  @Get()
  findAll(@UserId() userId: string, @Param("projectId") projectId: string) {
    return this.scenes.findAll(userId, projectId);
  }

  @Post()
  create(
    @UserId() userId: string,
    @Param("projectId") projectId: string,
    @Body(new ZodValidationPipe(CreateSceneSchema)) dto: CreateSceneDto,
  ) {
    return this.scenes.create(userId, projectId, dto);
  }

  /** Раскадровка, собранная во внешнем чате: вставленный JSON вместо LLM-вызова. */
  @Post("import")
  import(
    @UserId() userId: string,
    @Param("projectId") projectId: string,
    @Body(new ZodValidationPipe(ImportStoryboardSchema)) dto: ImportStoryboardDto,
  ) {
    return this.scenes.importStoryboard(userId, projectId, dto);
  }
}

@Controller("scenes")
@UseGuards(AuthGuard)
export class ScenesController {
  constructor(private readonly scenes: ScenesService) {}

  // Объявлен ДО ":id" — иначе Nest матчит "reorder" как параметр id.
  @Post("reorder")
  reorder(
    @UserId() userId: string,
    @Body(new ZodValidationPipe(ReorderScenesSchema)) dto: ReorderScenesDto,
  ) {
    return this.scenes.reorder(userId, dto);
  }

  @Post(":id/duplicate")
  duplicate(@UserId() userId: string, @Param("id") id: string) {
    return this.scenes.duplicate(userId, id);
  }

  @Patch(":id")
  update(
    @UserId() userId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateSceneSchema)) dto: UpdateSceneDto,
  ) {
    return this.scenes.update(userId, id, dto);
  }

  @Patch(":id/active-asset")
  setActiveAsset(
    @UserId() userId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(SetActiveAssetSchema)) dto: SetActiveAssetDto,
  ) {
    return this.scenes.setActiveAsset(userId, id, dto);
  }

  @Delete(":id")
  remove(@UserId() userId: string, @Param("id") id: string) {
    return this.scenes.remove(userId, id);
  }
}
