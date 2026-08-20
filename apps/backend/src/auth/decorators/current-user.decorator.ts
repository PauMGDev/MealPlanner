import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { User } from '../../generated/prisma/client.js';

/**
 * The user that JwtStrategy.validate() (or GoogleOAuthGuard) attached to the
 * request. Only valid on routes behind a guard that populates it.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User =>
    ctx.switchToHttp().getRequest<{ user: User }>().user,
);
