import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { UserType } from '../models/user.model'
import { UserException } from '../models/error.model'

export type WhereUniqueUserType = { email: string } | { id: number }

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUser(condition: WhereUniqueUserType): Promise<UserType | null> {
    return await this.prismaService.user.findFirst({
      where: { ...condition, deletedAt: null },
    })
  }

  async update(where: WhereUniqueUserType, data: Partial<Omit<UserType, 'id'>>): Promise<UserType> {
    if ('id' in where) {
      return await this.prismaService.user.update({
        where: { id: where.id, deletedAt: null },
        data,
      })
    }
    const existingUser = await this.prismaService.user.findFirst({
      where: { email: where.email, deletedAt: null },
    })
    if (!existingUser) {
      throw UserException.NotFound
    }
    return await this.prismaService.user.update({
      where: { id: existingUser.id },
      data,
    })
  }
}
