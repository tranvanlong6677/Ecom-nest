import { Injectable } from '@nestjs/common'
import { CreateUserBodyType, UpdateUserBodyType } from './users.model'
import { PrismaService } from '@/shared/services/prisma.service'
import { QueryParamsType } from '@/shared/models/request.model'

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: CreateUserBodyType) {
    return await this.prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        roleId: true,
        status: true,
      },
    })
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    })
  }

  async getList({ page, limit, sort }: QueryParamsType) {
    const skip = (page - 1) * limit
    const take = limit

    const [data, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        skip,
        take,
        orderBy: {
          updatedAt: sort,
        },
        include: {
          role: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ])

    return { data, totalItems, page, limit, totalPages: Math.ceil(totalItems / limit) }
  }

  async findById(id: number) {
    return await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    })
  }

  async update(id: number, data: UpdateUserBodyType, userId: number) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
        updatedById: userId,
      },
    })
  }

  async delete(id: number, deletedById: number, isHard: boolean = false) {
    if (isHard) {
      return await this.prisma.user.delete({
        where: { id },
      })
    }
    return await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById,
      },
    })
  }
}
