import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import { ZodError, ZodSchema } from "zod";

/**
 * Валидация тела запроса через Zod-схемы из @foundry/shared-types.
 * Один пайп на все контроллеры — class-validator не нужен, схемы уже общие с фронтом.
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: "Validation failed",
          issues: error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        });
      }
      throw error;
    }
  }
}
