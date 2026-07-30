import { Module } from "@nestjs/common";
import { ProjectsModule } from "../projects/projects.module";
import {
  ProjectScenesController,
  ScenesController,
} from "./scenes.controller";
import { ScenesService } from "./scenes.service";

@Module({
  imports: [ProjectsModule],
  controllers: [ProjectScenesController, ScenesController],
  providers: [ScenesService],
  exports: [ScenesService],
})
export class ScenesModule {}
