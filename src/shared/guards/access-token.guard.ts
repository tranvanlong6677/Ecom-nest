import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt'
import type { Request } from 'express'
import { REQUEST_USER_KEY } from '@/shared/constants/auth.constants'
import { isNotFoundPrismaError } from '@/shared/helper'
import { JwtService } from '@/shared/services/jwt.service'
import type { AccessTokenPayload } from '@/shared/types/jwt.type'
import { PrismaService } from '../services/prisma.service'
import { TokenException } from '../models/error.model'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractToken(request)
    const path = request.route?.path
    const method = request.method

    if (!token) {
      throw TokenException.AccessTokenMissing
    }

    let payload: AccessTokenPayload
    try {
      payload = await this.jwtService.verifyAccessToken(token)
      request[REQUEST_USER_KEY] = payload
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw TokenException.AccessTokenExpired
      }
      if (error instanceof JsonWebTokenError) {
        throw TokenException.AccessTokenInvalid
      }
      throw TokenException.AccessTokenInvalid
    }

    let isAccess: boolean
    try {
      const role = await this.prisma.role.findUniqueOrThrow({
        where: { id: payload.roleId, deletedAt: null },
        include: {
          permissions: {
            where: {
              deletedAt: null,
            },
            select: {
              id: true,
              name: true,
              description: true,
              path: true,
              method: true,
            },
          },
        },
      })
      const permissions = role.permissions.map((permission) => `${permission.method}-${permission.path}`)
      isAccess = permissions.includes(`${method}-${path}`)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw TokenException.AccessTokenAccessDenied
      }
      throw error
    }
    if (!isAccess) {
      throw TokenException.AccessTokenAccessDenied
    }

    return true
  }

  private extractToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : null
  }
}
