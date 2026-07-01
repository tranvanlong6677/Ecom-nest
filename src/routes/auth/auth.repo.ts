import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { RegisterBodyType, VerificationCodeType } from './auth.model'
import { TokenService } from '@/shared/services/token.service'
import { UserType } from '@/shared/models/user.model'

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async createUser(
    user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>,
    verificationEmail: string,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return await this.prismaService.$transaction(async (tx) => {
      const [newUser] = await Promise.all([
        tx.user.create({ data: user, omit: { password: true, totpSecret: true } }),
        tx.verificationCode.delete({ where: { email: verificationEmail } }),
      ])
      return newUser
    })
  }

  async generateTokens(payload: { userId: number }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: new Date(decodedRefreshToken.exp * 1000),
      },
    })
    return { accessToken, refreshToken }
  }

  async createVerificationCode(
    payload: Pick<VerificationCodeType, 'email' | 'type' | 'code' | 'expiresAt'>,
  ): Promise<VerificationCodeType> {
    return await this.prismaService.verificationCode.upsert({
      where: { email: payload.email },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    })
  }

  async findVerificationCode(
    condition: Pick<VerificationCodeType, 'email' | 'type' | 'code'>,
  ): Promise<VerificationCodeType | null> {
    return await this.prismaService.verificationCode.findFirst({
      where: condition,
    })
  }
}
