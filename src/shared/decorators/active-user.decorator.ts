import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { REQUEST_USER_KEY } from '../constants/auth.constants';
import type { AccessTokenPayload } from '../types/jwt.type';

export const ActiveUser = createParamDecorator(
  (field: keyof AccessTokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user: AccessTokenPayload | undefined = request[REQUEST_USER_KEY];
    return field ? user?.[field] : user;
  },
);
