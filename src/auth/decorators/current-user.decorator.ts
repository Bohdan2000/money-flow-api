import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from '../../users/schemas/user.schema';

interface RequestWithUser {
  user?: UserDocument;
}

export const CurrentUser = createParamDecorator(
  (
    data: keyof UserDocument | undefined,
    ctx: ExecutionContext,
  ): UserDocument | UserDocument[keyof UserDocument] | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) return undefined;
    if (data) return user[data];
    return user;
  },
);
