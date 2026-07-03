import { Injectable } from '@nestjs/common'
import { OAuthProvider } from '@/generated/prisma/client'
import { UserStatus } from '@/shared/constants/auth.constants'
import { UserType } from '@/shared/models/user.model'
import { PrismaService } from '@/shared/services/prisma.service'

interface CreateUserProviderInput {
  userId: number
  provider: OAuthProvider
  providerId: string
  email: string
}

interface CreateOAuthUserInput {
  email: string
  name: string
  avatar: string | null
  roleId: number
  provider: OAuthProvider
  providerId: string
}

@Injectable()
export class OAuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserProvider(provider: OAuthProvider, providerId: string): Promise<{ user: UserType } | null> {
    return await this.prismaService.userProvider.findUnique({
      where: { provider_providerId: { provider, providerId } },
      include: { user: true },
    })
  }

  async createUserProvider(data: CreateUserProviderInput) {
    return await this.prismaService.userProvider.create({ data })
  }

  async createOAuthUser(data: CreateOAuthUserInput): Promise<UserType> {
    return await this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          avatar: data.avatar,
          roleId: data.roleId,
          password: null,
          phoneNumber: null,
          status: UserStatus.ACTIVE,
        },
      })
      await tx.userProvider.create({
        data: {
          userId: user.id,
          provider: data.provider,
          providerId: data.providerId,
          email: data.email,
        },
      })
      return user
    })
  }
}
