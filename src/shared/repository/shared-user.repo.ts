import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { UserType } from '../models/user.model'

export type WhereUniqueUserType = { email: string } | { id: number }

@Injectable()
export class SharedRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUser(condition: WhereUniqueUserType): Promise<UserType | null> {
    return await this.prismaService.user.findUnique({
      where: { ...condition, deletedAt: null },
    })
  }

  update(where: WhereUniqueUserType, data: Partial<Omit<UserType, 'id'>>): Promise<UserType> {
    return this.prismaService.user.update({
      where: { ...where, deletedAt: null },
      data,
    })
  }
}
