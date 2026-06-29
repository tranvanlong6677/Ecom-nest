import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import { REQUEST_USER_KEY } from '../constants/auth.constants'
import type { TokenPayload } from '../types/jwt.type'

export const ActiveUser = createParamDecorator((field: keyof TokenPayload | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>()
  const user: TokenPayload = request[REQUEST_USER_KEY]
  return field ? user[field] : user
})
