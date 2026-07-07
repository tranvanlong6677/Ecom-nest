import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import {
  CreateRoleBodyType,
  GetRolesQueryType,
  RoleType,
  RoleWithPermissionsType,
  UpdateRoleBodyType,
} from './role.model'

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

  create(data: CreateRoleBodyType, createdById: number): Promise<RoleType> {
    return this.prismaService.role.create({
      data: { ...data, createdById },
    })
  }

  update(id: number, data: UpdateRoleBodyType, updatedById: number): Promise<RoleWithPermissionsType> {
    const { permissionIds, ...rest } = data
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

  delete(id: number, deletedById: number, isHard = false): Promise<RoleType> {
    if (isHard) {
      return this.prismaService.role.delete({
        where: { id },
      })
    }
    return this.prismaService.role.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), deletedById },
    })
  }
}
