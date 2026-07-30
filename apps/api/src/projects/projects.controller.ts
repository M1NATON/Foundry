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
  CreateProjectSchema,
  UpdateProjectSchema,
  type CreateProjectDto,
  type UpdateProjectDto,
} from "@foundry/shared-types";
import { AuthGuard } from "../common/auth.guard";
import { UserId } from "../common/user-id.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { ProjectsService } from "./projects.service";

@Controller("projects")
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post()
  create(
    @UserId() userId: string,
    @Body(new ZodValidationPipe(CreateProjectSchema)) dto: CreateProjectDto,
  ) {
    return this.projects.create(userId, dto);
  }

  @Get()
  findAll(@UserId() userId: string) {
    return this.projects.findAll(userId);
  }

  @Get(":id")
  findOne(@UserId() userId: string, @Param("id") id: string) {
    return this.projects.findOne(userId, id);
  }

  @Patch(":id")
  update(
    @UserId() userId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateProjectSchema)) dto: UpdateProjectDto,
  ) {
    return this.projects.update(userId, id, dto);
  }

  @Delete(":id")
  remove(@UserId() userId: string, @Param("id") id: string) {
    return this.projects.remove(userId, id);
  }
}
