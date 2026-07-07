import { Injectable } from '@nestjs/common'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helper'
import { PermissionException } from '@/shared/models/error.model'
import { PermissionRepository } from './permission.repo'
import { CreatePermissionBodyType, GetPermissionsQueryType, UpdatePermissionBodyType } from './permission.model'

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepo: PermissionRepository) {}

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
      return await this.permissionRepo.update(id, body, updatedById)
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
      await this.permissionRepo.delete(id, deletedById, isHard)
      return { message: 'Permission deleted successfully' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PermissionException.NotFound
      }
      throw error
    }
  }
}
