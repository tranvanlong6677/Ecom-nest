import { Inject, Injectable } from '@nestjs/common'
import { generateRoleCacheKey, isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helper'
import { PermissionException } from '@/shared/models/error.model'
import { PermissionRepository } from './permission.repo'
import { CreatePermissionBodyType, GetPermissionsQueryType, UpdatePermissionBodyType } from './permission.model'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { RoleType } from '@/shared/models/role.model'

@Injectable()
export class PermissionService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly permissionRepo: PermissionRepository,
  ) {}

  async findAll(query: GetPermissionsQueryType) {
    const { data, totalItems } = await this.permissionRepo.findAll(query)
    return {
      data,
      totalItems,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(totalItems / query.limit),
    }
  }

  async findById(id: number) {
    const permission = await this.permissionRepo.findById(id)
    if (!permission) {
      throw PermissionException.NotFound
    }
    return permission
  }

  async create(body: CreatePermissionBodyType, createdById: number) {
    try {
      return await this.permissionRepo.create(body, createdById)
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionException.AlreadyExists
      }
      throw error
    }
  }

  async update(id: number, body: UpdatePermissionBodyType, updatedById: number) {
    try {
      const result = await this.permissionRepo.update(id, body, updatedById)
      const roles = result.roles
      await this.deleteCachedRole(roles)
      return result
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PermissionException.NotFound
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionException.AlreadyExists
      }
      throw error
    }
  }

  async delete(id: number, deletedById: number, isHard = false) {
    try {
      const permissions = await this.permissionRepo.delete(id, deletedById, isHard)
      const roles = permissions.roles
      await this.deleteCachedRole(roles)
      return { message: 'Permission deleted successfully' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PermissionException.NotFound
      }
      throw error
    }
  }

  async deleteCachedRole(roles: RoleType[]) {
    return Promise.all(roles.map((role) => this.cacheManager.del(generateRoleCacheKey(role.id))))
  }
}
