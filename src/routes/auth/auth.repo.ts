import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import {
  DeviceType,
  RefreshTokenType,
  RegisterBodyType,
  VerificationCodePurposeType,
  VerificationCodeType,
} from './auth.model'
import { TokenService } from '@/shared/services/token.service'
import { UserType, UserWithRoleType } from '@/shared/models/user.model'
import { AccessTokenCreateType } from '@/shared/types/jwt.type'
import { RoleType } from '@/shared/models/role.model'
import { VerificationCodePurpose } from '@/shared/constants/auth.constants'
import { TotpService } from '@/shared/services/totp.service'
import { WhereUniqueUserType } from '@/shared/repository/shared-user.repo'
import { UserException } from '@/shared/models/error.model'

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly totpService: TotpService,
  ) {}

  async createUser(
    user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>,
    verificationEmail: string,
    code,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return await this.prismaService.$transaction(async (tx) => {
      const [newUser] = await Promise.all([
        tx.user.create({ data: user, omit: { password: true, totpSecret: true } }),
        tx.verificationCode.delete({
          where: { email_code_type: { email: verificationEmail, code, type: VerificationCodePurpose.REGISTER } },
        }),
      ])
      return newUser
    })
  }

  async resetPassword(payload: {
    email: string
    code: string
    type: VerificationCodePurposeType
    hashedPassword: string
  }): Promise<UserType> {
    const { email, code, type, hashedPassword } = payload
    return await this.prismaService.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({ where: { email, deletedAt: null } })
      if (!existingUser) {
        throw UserException.NotFound
      }
      const [user] = await Promise.all([
        tx.user.update({ where: { id: existingUser.id }, data: { password: hashedPassword } }),
        tx.verificationCode.delete({ where: { email_code_type: { email, code, type } } }),
      ])
      return user
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
    return this.prismaService.device.create({ data })
  }

  async updateDevice(data: Partial<DeviceType>) {
    await this.prismaService.device.update({
      where: { id: data.id },
      data,
    })
  }

  async revokeRefreshToken(refreshToken: string): Promise<RefreshTokenType> {
    return await this.prismaService.refreshToken.delete({
      where: { token: refreshToken },
    })
  }

  async createVerificationCode(
    payload: Pick<VerificationCodeType, 'email' | 'type' | 'code' | 'expiresAt'>,
  ): Promise<VerificationCodeType> {
    return await this.prismaService.verificationCode.upsert({
      where: { email_code_type: { email: payload.email, type: payload.type, code: payload.code } },
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

  async findUserWithRole(condition: WhereUniqueUserType): Promise<UserWithRoleType | null> {
    return await this.prismaService.user.findFirst({
      where: { ...condition, deletedAt: null },
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

  deleteVerificationCode(
    uniqueValue:
      | { id: number }
      | {
          email: string
          code: string
          type: VerificationCodePurposeType
        },
  ): Promise<VerificationCodeType> {
    if ('id' in uniqueValue) {
      return this.prismaService.verificationCode.delete({ where: { id: uniqueValue.id } })
    }

    return this.prismaService.verificationCode.delete({
      where: {
        email_code_type: { email: uniqueValue.email, code: uniqueValue.code, type: uniqueValue.type },
      },
    })
  }
}
