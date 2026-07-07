import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import {
  CreatePermissionBodyType,
  GetPermissionsQueryType,
  PermissionType,
  UpdatePermissionBodyType,
} from './permission.model'

@Injectable()
export class PermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: GetPermissionsQueryType): Promise<{ data: PermissionType[]; totalItems: number }> {
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
    return { data, totalItems }
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

  update(id: number, data: UpdatePermissionBodyType, updatedById: number): Promise<PermissionType> {
    return this.prismaService.permission.update({
      where: { id, deletedAt: null },
      data: { ...data, updatedById },
    })
  }

  delete(id: number, deletedById: number, isHard = false): Promise<PermissionType> {
    if (isHard) {
      return this.prismaService.permission.delete({
        where: { id },
      })
    }
    return this.prismaService.permission.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date(), deletedById },
    })
  }
}
