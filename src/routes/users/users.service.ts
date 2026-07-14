import { PaginationParamsType } from '@/shared/models/request.model'
import { Injectable } from '@nestjs/common'
import { UsersRepository } from './users.repo'
import { isNotFoundPrismaError } from '@/shared/helper'
import { RoleException, UserException } from '@/shared/models/error.model'
import { CreateUserBodyType, UpdateUserBodyType } from './users.model'
import { HashingService } from '@/shared/services/hashing.service'
import { SharedRolesRepository } from '@/shared/repository/shared-role.repo'
import { RoleName } from '@/shared/constants/role.constant'

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashingService: HashingService,
    private readonly sharedRoleRepository: SharedRolesRepository,
  ) {}

  private verifyYourself({ userAgentId, userTargetId }: { userAgentId: number; userTargetId: number }) {
    if (userAgentId === userTargetId) {
      throw UserException.CannotUpdateOrDeleteYourself
    }
  }

  private async verifyRole({ roleNameAgent, roleIdTarget }: { roleNameAgent: string; roleIdTarget: number }) {
    const targetRole = await this.sharedRoleRepository.findRoleById(roleIdTarget)
    if (roleNameAgent === RoleName.Admin && !!targetRole) {
      return
    }
    if (!targetRole) {
      throw RoleException.NotFound
    }
    if (targetRole.name === RoleName.Admin) {
      throw UserException.CannotSetAdminRole
    }
  }

  private async verifyNotUpdatingOrDeletingAdmin({
    roleNameAgent,
    userTargetId,
  }: {
    roleNameAgent: string
    userTargetId: number
  }) {
    if (roleNameAgent === RoleName.Admin) {
      return
    }
    const targetUser = await this.usersRepository.findById(userTargetId)
    if (!targetUser) {
      throw UserException.NotFound
    }
    const targetRole = await this.sharedRoleRepository.findRoleById(targetUser.roleId)
    if (targetRole?.name === RoleName.Admin) {
      throw UserException.CannotUpdateOrDeleteAdmin
    }
  }

  async create(data: CreateUserBodyType, roleNameAgent: string) {
    await this.verifyRole({ roleNameAgent, roleIdTarget: data.roleId })
    try {
      const hashedPassword = await this.hashingService.hash(data.password)
      return await this.usersRepository.createUser({ ...data, password: hashedPassword })
    } catch (error) {
      throw error
    }
  }

  async getList(query: PaginationParamsType) {
    try {
      return await this.usersRepository.getList(query)
    } catch (error) {
      throw error
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.usersRepository.findById(id)
      if (!user) {
        throw UserException.NotFound
      }
      return user
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw UserException.NotFound
      }
      throw error
    }
  }

  async update(id: number, data: UpdateUserBodyType, userAgentId: number, roleNameAgent: string) {
    this.verifyYourself({ userAgentId, userTargetId: id })
    await this.verifyNotUpdatingOrDeletingAdmin({ roleNameAgent, userTargetId: id })
    await this.verifyRole({ roleNameAgent, roleIdTarget: data.roleId })

    try {
      return await this.usersRepository.update(id, data, userAgentId)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw UserException.NotFound
      }
      throw error
    }
  }

  async remove(id: number, userAgentId: number, roleNameAgent: string) {
    this.verifyYourself({ userAgentId, userTargetId: id })
    await this.verifyNotUpdatingOrDeletingAdmin({ roleNameAgent, userTargetId: id })

    try {
      await this.usersRepository.delete(id, userAgentId)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw UserException.NotFound
      }
      throw error
    }
  }
}
