import { diskStorage } from "multer";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  AssetType,
  CreateAssetSchema,
  GenerateMissingSchema,
  type CreateAssetDto,
  type GenerateMissingDto,
} from "@foundry/shared-types";
import { AuthGuard } from "../common/auth.guard";
import { UserId } from "../common/user-id.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AssetsService } from "./assets.service";
import {
  UPLOAD_DIR,
  UPLOAD_MAX_BYTES,
  assertAllowedFile,
} from "./upload";

@Controller("projects/:projectId/assets")
@UseGuards(AuthGuard)
export class ProjectAssetsController {
  constructor(private readonly assets: AssetsService) {}

  /** Догенерировать недостающие слоты по всем сценам проекта разом. */
  @Post("generate-missing")
  generateMissing(
    @UserId() userId: string,
    @Param("projectId") projectId: string,
    @Body(new ZodValidationPipe(GenerateMissingSchema)) dto: GenerateMissingDto,
  ) {
    return this.assets.generateMissing(userId, projectId, dto.types);
  }
}

@Controller("scenes/:sceneId/assets")
@UseGuards(AuthGuard)
export class SceneAssetsController {
  constructor(private readonly assets: AssetsService) {}

  @Post()
  create(
    @UserId() userId: string,
    @Param("sceneId") sceneId: string,
    @Body(new ZodValidationPipe(CreateAssetSchema)) dto: CreateAssetDto,
  ) {
    return this.assets.create(userId, sceneId, dto);
  }

  /** Прямая загрузка готового файла (кадр/клип/голос/музыка) без генерации. */
  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const safe = file.originalname.replace(/[^\w.-]/g, "_");
          cb(null, `${Date.now()}-${safe}`);
        },
      }),
      limits: { fileSize: UPLOAD_MAX_BYTES },
    }),
  )
  upload(
    @UserId() userId: string,
    @Param("sceneId") sceneId: string,
    @Body("type") rawType: string,
    @UploadedFile() file?: { filename: string; originalname: string },
  ) {
    const parsed = AssetType.safeParse(rawType);
    if (!parsed.success) throw new BadRequestException("Unknown asset type");
    if (!file) throw new BadRequestException("File is required");
    assertAllowedFile(file.originalname, parsed.data);
    return this.assets.attachUpload(
      userId,
      sceneId,
      parsed.data,
      file.filename,
      file.originalname,
    );
  }
}

@Controller("assets")
@UseGuards(AuthGuard)
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  @Get(":id")
  findOne(@UserId() userId: string, @Param("id") id: string) {
    return this.assets.findOne(userId, id);
  }

  @Delete(":id")
  remove(@UserId() userId: string, @Param("id") id: string) {
    return this.assets.remove(userId, id);
  }
}
