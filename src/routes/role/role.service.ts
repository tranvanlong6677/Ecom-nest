import { Injectable } from '@nestjs/common'
import { isNotFoundPrismaError } from '@/shared/helper'
import { RoleException } from '@/shared/models/error.model'
import { RoleRepository } from './role.repo'
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from './role.model'
import { RoleName } from '@/shared/constants/role.constant'
import { RoleType } from '@/shared/models/role.model'

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepository) {}

  async findAll(query: GetRolesQueryType) {
    try {
      const { data, totalItems } = await this.roleRepo.findAll(query)
      return {
        data,
        totalItems,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(totalItems / query.limit),
      }
    } catch (error) {
      throw error
    }
  }

  async findById(id: number) {
    try {
      const role = await this.roleRepo.findById(id)
      if (!role) {
        throw RoleException.NotFound
      }
      return role
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw RoleException.NotFound
      }
      throw error
    }
  }

  async create(body: CreateRoleBodyType, createdById: number) {
    try {
      return await this.roleRepo.create(body, createdById)
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async update(roleId: number, body: UpdateRoleBodyType, updatedById: number) {
    try {
      await this.verifyRole(roleId)
      return await this.roleRepo.update(roleId, body, updatedById)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw RoleException.NotFound
      }
      throw error
    }
  }

  async delete(roleId: number, deletedById: number, isHard = false) {
    try {
      await this.verifyRole(roleId)
      await this.roleRepo.delete(roleId, deletedById, isHard)
      return { message: 'Role deleted successfully' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw RoleException.NotFound
      }
      throw error
    }
  }

  async verifyRole(roleId: number) {
    const role = await this.findById(roleId)
    if (!role) {
      throw RoleException.NotFound
    }
    const baseRoles = [...Object.values(RoleName)] as string[]
    if (baseRoles.includes(role.name)) {
      throw RoleException.BaseRoleCannotBeDeleted
    }
    return role
  }
}
