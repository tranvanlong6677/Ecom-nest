import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { HashingService } from '@/shared/services/hashing.service'
import { PrismaService } from '@/shared/services/prisma.service'
import { TokenService } from '@/shared/services/token.service'
import { RolesService } from '@/routes/auth/role.service'
import { generateOTP, isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helper'
import { LoginBodyType, RegisterBodyType, SendOTPBodyType } from './auth.model'
import { VerificationCodePurpose } from '@/shared/constants/auth.constants'
import { AuthRepository } from './auth.repo'
import { SharedRepository } from '@/shared/repository/shared-user.repo'
import { EmailService } from '@/shared/services/email.service'
import envConfig from '@/shared/config'
import ms from 'ms'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
    private readonly authRepo: AuthRepository,
    private readonly sharedRepo: SharedRepository,
    private readonly emailService: EmailService,
  ) {}
  async register(body: RegisterBodyType) {
    try {
      const verificationCode = await this.authRepo.findVerificationCode({
        email: body.email,
        code: body.code,
        type: VerificationCodePurpose.REGISTER,
      })
      if (!verificationCode) {
        throw new UnprocessableEntityException([{ path: 'code', message: 'OTP code is incorrect' }])
      }
      if (verificationCode.expiresAt < new Date()) {
        throw new UnprocessableEntityException([{ path: 'code', message: 'OTP code is expired' }])
      }
      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)
      return await this.authRepo.createUser(
        {
          email: body.email,
          name: body.name,
          phoneNumber: body.phoneNumber,
          password: hashedPassword,
          roleId: clientRoleId,
        },
        body.email,
      )
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Email đã tồn tại')
      }
      throw error
    }
  }

  async login(body: LoginBodyType) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
    })

    if (!user) {
      throw new UnauthorizedException('Account is not exist')
    }

    const isPasswordMatch = await this.hashingService.compare(body.password, user.password)
    if (!isPasswordMatch) {
      throw new UnprocessableEntityException([
        {
          field: 'password',
          error: 'Password is incorrect',
        },
      ])
    }
    const tokens = await this.authRepo.generateTokens({ userId: user.id })
    return tokens
  }

  async refreshToken(refreshToken: string) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ không
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)
      // 2. Kiểm tra refreshToken có tồn tại trong database không
      await this.prismaService.refreshToken.findUniqueOrThrow({
        where: {
          token: refreshToken,
        },
      })
      // 3. Xóa refreshToken cũ
      await this.prismaService.refreshToken.delete({
        where: {
          token: refreshToken,
        },
      })
      // 4. Tạo mới accessToken và refreshToken
      return await this.authRepo.generateTokens({ userId })
    } catch (error) {
      // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
      // refresh token của họ đã bị đánh cắp
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token has been revoked')
      }
      throw new UnauthorizedException()
    }
  }

  async logout(refreshToken: string) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ không
      await this.tokenService.verifyRefreshToken(refreshToken)
      // 2. Xóa refreshToken trong database
      await this.prismaService.refreshToken.delete({
        where: {
          token: refreshToken,
        },
      })
      return { message: 'Logout successfully' }
    } catch (error) {
      // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
      // refresh token của họ đã bị đánh cắp
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token has been revoked')
      }
      throw new UnauthorizedException()
    }
  }

  async sendOtp(body: SendOTPBodyType) {
    const user = await this.sharedRepo.findUser({ email: body.email })
    const isRegister = body.type === VerificationCodePurpose.REGISTER
    if (isRegister && user) {
      throw new UnprocessableEntityException([{ path: 'email', message: 'Email already exists' }])
    }
    if (!isRegister && !user) {
      throw new UnprocessableEntityException([{ path: 'email', message: 'Account does not exist' }])
    }

    const otpCode = generateOTP()
    const expiresAt = new Date(Date.now() + ms(envConfig.OTP_EXPIRES as ms.StringValue))

    await this.authRepo.createVerificationCode({
      email: body.email,
      type: body.type,
      code: otpCode,
      expiresAt,
    })

    const expiresInMinutes = Math.floor(ms(envConfig.OTP_EXPIRES as ms.StringValue) / 60000)
    await this.emailService.sendOtp({
      email: body.email,
      code: otpCode,
      expiresInMinutes,
      type: body.type,
    })
    return { message: 'OTP sent successfully' }
  }
}
