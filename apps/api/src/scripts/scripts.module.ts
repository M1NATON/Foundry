import { Module } from "@nestjs/common";
import { LlmModule } from "../llm/llm.module";
import { ProjectsModule } from "../projects/projects.module";
import { ScriptsController } from "./scripts.controller";
import { ScriptsService } from "./scripts.service";

@Module({
  imports: [ProjectsModule, LlmModule],
  controllers: [ScriptsController],
  providers: [ScriptsService],
  exports: [ScriptsService],
})
export class ScriptsModule {}
