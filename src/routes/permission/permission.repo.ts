import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { CreatePermissionBodyType, GetPermissionsQueryType, UpdatePermissionBodyType } from './permission.model'
import { PermissionType } from '@/shared/models/permission.model'
import { RoleType } from '@/shared/models/role.model'

@Injectable()
export class PermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(
    query: GetPermissionsQueryType,
  ): Promise<{ data: Record<string, PermissionType[]>; totalItems: number }> {
    const { page, limit } = query
    const skip = (page - 1) * limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.permission.count({ where: { deletedAt: null } }),
      this.prismaService.permission.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
    ])
    //Divide permissions by module
    let permissionDivideByModule: Record<string, PermissionType[]> = {}
    data.forEach((item) => {
      if (!permissionDivideByModule[item.module]) {
        permissionDivideByModule[item.module] = [item]
      } else {
        permissionDivideByModule[item.module] = [...permissionDivideByModule[item.module], item]
      }
    })
    return { data: permissionDivideByModule, totalItems }
  }

  findById(id: number): Promise<PermissionType | null> {
    return this.prismaService.permission.findFirst({
      where: { id, deletedAt: null },
    })
  }

  create(data: CreatePermissionBodyType, createdById: number): Promise<PermissionType> {
    return this.prismaService.permission.create({
      data: { ...data, createdById },
    })
  }

  update(
    id: number,
    data: UpdatePermissionBodyType,
    updatedById: number,
  ): Promise<PermissionType & { roles: RoleType[] }> {
    return this.prismaService.permission.update({
      where: { id, deletedAt: null },
      data: { ...data, updatedById },
      include: {
        roles: true,
      },
    })
  }

  delete(id: number, deletedById: number, isHard = false): Promise<PermissionType & { roles: RoleType[] }> {
    if (isHard) {
      return this.prismaService.permission.delete({
        where: { id },
        include: {
          roles: true,
        },
      })
    }
    return this.prismaService.permission.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), deletedById },
      include: {
        roles: true,
      },
    })
  }
}
