import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { ProfileResType, UpdateProfileBodyType, UpdateProfileResType } from './profile.model'

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(id: number): Promise<ProfileResType> {
    return this.prisma.user.findUniqueOrThrow({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: {
              select: {
                id: true,
                name: true,
                description: true,
                path: true,
                method: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  updateProfile(id: number, data: UpdateProfileBodyType): Promise<UpdateProfileResType> {
    return this.prisma.user.update({
      where: { id, deletedAt: null },
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        avatar: data.avatar,
      },
    })
  }

  updatePassword(id: number, password: string) {
    return this.prisma.user.update({
      where: { id, deletedAt: null },
      data: {
        password,
      },
    })
  }
}
