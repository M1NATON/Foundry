import { Module } from "@nestjs/common";
import { ProjectsModule } from "../projects/projects.module";
import { ExportController } from "./export.controller";
import { ExportService } from "./export.service";

@Module({
  imports: [ProjectsModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
