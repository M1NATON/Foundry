import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { ProjectsModule } from "./projects/projects.module";
import { ResearchModule } from "./research/research.module";
import { ScriptsModule } from "./scripts/scripts.module";
import { ScenesModule } from "./scenes/scenes.module";
import { AssetsModule } from "./assets/assets.module";
import { ExportModule } from "./export/export.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProjectsModule,
    ResearchModule,
    ScriptsModule,
    ScenesModule,
    AssetsModule,
    ExportModule,
  ],
})
export class AppModule {}
