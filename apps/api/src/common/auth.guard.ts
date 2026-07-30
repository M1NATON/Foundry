import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";

export const DEV_USER_ID = "dev-user";

export interface AuthedRequest extends Request {
  userId: string;
}

/**
 * Единственный шов авторизации в приложении.
 *
 * MVP: один пользователь. Если CLERK_SECRET_KEY не задан — работаем в dev-режиме
 * и подставляем DEV_USER_ID, чтобы приложение поднималось без внешних ключей.
 * Когда появится Clerk — верификация токена делается ровно здесь, остальной код
 * уже читает req.userId и меняться не будет.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const devMode = !process.env.CLERK_SECRET_KEY;

    if (devMode) {
      req.userId = (req.header("x-user-id") ?? DEV_USER_ID).trim();
      return true;
    }

    // TODO(clerk): verifyToken(bearer, { secretKey: process.env.CLERK_SECRET_KEY })
    const userId = req.header("x-user-id")?.trim();
    if (!userId) {
      throw new UnauthorizedException("Missing user context");
    }
    req.userId = userId;
    return true;
  }
}
