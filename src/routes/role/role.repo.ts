import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { CreateRoleBodyType, GetRolesQueryType, RoleWithPermissionsType, UpdateRoleBodyType } from './role.model'
import { RoleException } from '@/shared/models/error.model'
import { RoleType } from '@/shared/models/role.model'

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: GetRolesQueryType): Promise<{ data: RoleType[]; totalItems: number }> {
    const { page, limit } = query
    const skip = (page - 1) * limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.role.count({ where: { deletedAt: null } }),
      this.prismaService.role.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
    ])
    return { data, totalItems }
  }

  findById(id: number): Promise<RoleWithPermissionsType | null> {
    return this.prismaService.role.findFirst({
      where: { id, deletedAt: null },
      include: {
        permissions: { where: { deletedAt: null } },
      },
    })
  }

  create(data: CreateRoleBodyType, createdById: number): Promise<RoleWithPermissionsType> {
    return this.prismaService.role.create({
      data: { ...data, createdById },
      include: {
        permissions: {
          where: { deletedAt: null },
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
  }

  async update(id: number, data: UpdateRoleBodyType, updatedById: number): Promise<RoleWithPermissionsType> {
    const { permissionIds, ...rest } = data
    if (permissionIds.length > 0) {
      const validPermission = await this.prismaService.permission.findMany({
        where: { id: { in: permissionIds }, deletedAt: null },
      })
      if (validPermission.length !== permissionIds.length) {
        const invalidPermissionIds = permissionIds.filter(
          (permissionId) => !validPermission.some((permission) => permission.id === permissionId),
        )

        throw RoleException.InvalidPermissionIds(invalidPermissionIds)
      }
    }

    return this.prismaService.role.update({
      where: { id, deletedAt: null },
      data: {
        ...rest,
        updatedById,
        permissions: { set: permissionIds.map((permissionId) => ({ id: permissionId })) },
      },
      include: {
        permissions: {
          where: { deletedAt: null },
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
  }

  delete(roleId: number, deletedById: number, isHard = false): Promise<RoleType> {
    if (isHard) {
      return this.prismaService.role.delete({
        where: { id: roleId },
      })
    }
    return this.prismaService.role.update({
      where: { id: roleId, deletedAt: null },
      data: { deletedAt: new Date(), deletedById },
    })
  }
}
