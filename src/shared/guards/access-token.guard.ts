import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common'
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt'
import type { Request } from 'express'
import { keyBy } from 'lodash'
import { REQUEST_USER_KEY } from '@/shared/constants/auth.constants'
import { generateRoleCacheKey, isNotFoundPrismaError } from '@/shared/helper'
import { JwtService } from '@/shared/services/jwt.service'
import type { AccessTokenPayload } from '@/shared/types/jwt.type'
import { PrismaService } from '../services/prisma.service'
import { TokenException } from '../models/error.model'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import type { Cache } from '@nestjs/cache-manager'
import type { RoleWithPermissionsType } from '@/routes/role/role.model'

type Permission = RoleWithPermissionsType['permissions'][number]

type CachedRoleType = Omit<RoleWithPermissionsType, 'permissions'> & {
  permissions: Record<string, Permission>
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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
    const cacheKeyRole = generateRoleCacheKey(payload.roleId)
    const cachedRole = await this.cacheManager.get<CachedRoleType>(cacheKeyRole)
    try {
      let role: CachedRoleType
      if (cachedRole) {
        role = cachedRole
      } else {
        const roleWithPermissions = await this.prisma.role.findUniqueOrThrow({
          where: { id: payload.roleId, deletedAt: null, isActive: true },
          include: {
            permissions: {
              where: {
                deletedAt: null,
              },
            },
          },
        })
        role = {
          ...roleWithPermissions,
          permissions: keyBy(
            roleWithPermissions.permissions,
            (permission) => `${permission.method}-${permission.path}`,
          ),
        }
        await this.cacheManager.set(cacheKeyRole, role, 1000 * 60 * 60)
      }

      isAccess = Boolean(role.permissions[`${method}-${path}`])
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
