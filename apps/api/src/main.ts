import "reflect-metadata";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { UPLOAD_DIR } from "./assets/upload";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });
  app.setGlobalPrefix("api");

  // Раздача пользовательских загрузок; setGlobalPrefix статику не покрывает.
  mkdirSync(UPLOAD_DIR, { recursive: true });
  app.useStaticAssets(join(process.cwd(), UPLOAD_DIR), {
    prefix: `/api/${UPLOAD_DIR}/`,
  });

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  new Logger("Bootstrap").log(`Foundry API listening on :${port}/api`);
}

void bootstrap();
