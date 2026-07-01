import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { UserType } from '../models/user.model'

@Injectable()
export class SharedRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUser(condition: { email: string } | { id: number }): Promise<UserType | null> {
    return await this.prismaService.user.findUnique({
      where: condition,
    })
  }
}
