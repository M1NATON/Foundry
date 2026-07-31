import { Module } from "@nestjs/common";
import { ProjectsModule } from "../projects/projects.module";
import {
  AssetsController,
  ProjectAssetsController,
  SceneAssetsController,
} from "./assets.controller";
import { AssetsProcessor } from "./assets.processor";
import { AssetsQueue } from "./assets.queue";
import { AssetsService } from "./assets.service";

@Module({
  imports: [ProjectsModule],
  controllers: [ProjectAssetsController, SceneAssetsController, AssetsController],
  providers: [AssetsService, AssetsQueue, AssetsProcessor],
  exports: [AssetsService],
})
export class AssetsModule {}
