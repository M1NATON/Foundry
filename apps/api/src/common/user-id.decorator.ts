import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AuthedRequest } from "./auth.guard";

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    return req.userId;
  },
);
