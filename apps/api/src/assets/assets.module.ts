import { Module } from "@nestjs/common";
import { ProjectsModule } from "../projects/projects.module";
import {
  AssetsController,
  SceneAssetsController,
} from "./assets.controller";
import { AssetsProcessor } from "./assets.processor";
import { AssetsQueue } from "./assets.queue";
import { AssetsService } from "./assets.service";

@Module({
  imports: [ProjectsModule],
  controllers: [SceneAssetsController, AssetsController],
  providers: [AssetsService, AssetsQueue, AssetsProcessor],
  exports: [AssetsService],
})
export class AssetsModule {}
