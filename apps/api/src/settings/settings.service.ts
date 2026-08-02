import { Injectable } from "@nestjs/common";
import {
  DEFAULT_USER_SETTINGS,
  type UpdateUserSettingsDto,
  type UserSettings,
} from "@foundry/shared-types";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Строки может не быть — это не ошибка, а «ничего ещё не меняли». */
  async findOne(userId: string): Promise<UserSettings> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });
    if (!settings) return DEFAULT_USER_SETTINGS;

    return {
      defaultVisualStyle:
        settings.defaultVisualStyle as UserSettings["defaultVisualStyle"],
      defaultVisualStyleCustom: settings.defaultVisualStyleCustom,
    };
  }

  async update(
    userId: string,
    dto: UpdateUserSettingsDto,
  ): Promise<UserSettings> {
    const current = await this.findOne(userId);
    const next: UserSettings = {
      defaultVisualStyle: dto.defaultVisualStyle ?? current.defaultVisualStyle,
      defaultVisualStyleCustom:
        dto.defaultVisualStyleCustom !== undefined
          ? dto.defaultVisualStyleCustom
          : current.defaultVisualStyleCustom,
    };

    await this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...next },
      update: next,
    });

    return next;
  }
}
