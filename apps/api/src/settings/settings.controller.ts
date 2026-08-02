import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import {
  UpdateUserSettingsSchema,
  type UpdateUserSettingsDto,
} from "@foundry/shared-types";
import { AuthGuard } from "../common/auth.guard";
import { UserId } from "../common/user-id.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { SettingsService } from "./settings.service";

@Controller("settings")
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  findOne(@UserId() userId: string) {
    return this.settings.findOne(userId);
  }

  @Patch()
  update(
    @UserId() userId: string,
    @Body(new ZodValidationPipe(UpdateUserSettingsSchema))
    dto: UpdateUserSettingsDto,
  ) {
    return this.settings.update(userId, dto);
  }
}
