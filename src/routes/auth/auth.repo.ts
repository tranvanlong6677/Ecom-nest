import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { DeviceType, RefreshTokenType, RegisterBodyType, VerificationCodeType } from './auth.model'
import { TokenService } from '@/shared/services/token.service'
import { UserType, UserWithRoleType } from '@/shared/models/user.model'
import { AccessTokenCreateType } from '@/shared/types/jwt.type'
import { RoleType } from '@/shared/models/role.model'

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

  async generateTokens(payload: AccessTokenCreateType) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId: payload.userId,
        roleId: payload.roleId,
        roleName: payload.roleName,
        deviceId: payload.deviceId,
      }),
      this.tokenService.signRefreshToken({
        userId: payload.userId,
      }),
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.createRefreshToken({
      userId: payload.userId,
      token: refreshToken,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId: payload.deviceId,
    })
    return { accessToken, refreshToken }
  }

  async createRefreshToken(payload: { userId: number; token: string; expiresAt: Date | string; deviceId: number }) {
    await this.prismaService.refreshToken.create({
      data: {
        token: payload.token,
        userId: payload.userId,
        expiresAt: payload.expiresAt,
        deviceId: payload.deviceId,
      },
    })
    return { refreshToken: payload.token }
  }

  async createDevice(
    data: Pick<DeviceType, 'userId' | 'userAgent' | 'ip'> & Partial<Pick<DeviceType, 'lastActive' | 'isActive'>>,
  ): Promise<DeviceType> {
    const res = await this.prismaService.device
      .create({
        data,
      })
      .catch((error) => {
        console.log(error)
        throw error
      })
    return res
  }

  async updateDevice(data: Partial<DeviceType>) {
    await this.prismaService.device.update({
      where: { id: data.id },
      data,
    })
  }

  async revokeRefreshToken(refreshToken: string) {
    await this.prismaService.refreshToken.delete({
      where: { token: refreshToken },
    })
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

  async findUserWithRole(condition: { email: string } | { id: number }): Promise<UserWithRoleType | null> {
    return await this.prismaService.user.findUnique({
      where: condition,
      include: { role: true },
    })
  }

  async findRefreshToken(condition: {
    token: string
  }): Promise<(RefreshTokenType & { user: UserType & { role: RoleType } }) | null> {
    return await this.prismaService.refreshToken.findUnique({
      where: condition,
      include: {
        user: {
          include: { role: true },
        },
      },
    })
  }
}
