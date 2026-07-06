import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common'
import { HashingService } from '@/shared/services/hashing.service'
import { PrismaService } from '@/shared/services/prisma.service'
import { TokenService } from '@/shared/services/token.service'
import { RolesService } from '@/routes/auth/role.service'
import { generateOTP, isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helper'
import {
  DeviceType,
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType,
  VerificationCodePurposeType,
} from './auth.model'
import { VerificationCodePurpose } from '@/shared/constants/auth.constants'
import { AuthRepository } from './auth.repo'
import { SharedRepository } from '@/shared/repository/shared-user.repo'
import { EmailService } from '@/shared/services/email.service'
import envConfig from '@/shared/config'
import ms from 'ms'
import {
  EmailException,
  EmailOrPasswordException,
  OtpException,
  PasswordException,
  TokenException,
} from '@/shared/models/error.model'

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
        throw OtpException.Invalid
      }
      if (verificationCode.expiresAt < new Date()) {
        throw OtpException.Expired
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
        verificationCode,
      )
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailException.Exists
      }
      throw error
    }
  }

  async login(body: LoginBodyType & Pick<DeviceType, 'userAgent' | 'ip'>) {
    const user = await this.authRepo.findUserWithRole({ email: body.email })
    if (!user) {
      throw EmailOrPasswordException.Mismatch
    }

    if (!user.password) {
      throw EmailOrPasswordException.Mismatch
    }

    const isPasswordMatch = body.password && (await this.hashingService.compare(body.password, user.password))
    if (!isPasswordMatch) {
      throw EmailOrPasswordException.Mismatch
    }

    const device = await this.authRepo.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    })

    return await this.authRepo.generateTokens({
      userId: user.id,
      roleId: user.roleId,
      deviceId: device.id,
      roleName: user.role.name,
    })
  }

  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & Pick<DeviceType, 'userAgent' | 'ip'>) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ không
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)
      // 2. Kiểm tra refreshToken có tồn tại trong database không
      const tokenWithUserAndRole = await this.authRepo.findRefreshToken({
        token: refreshToken,
      })
      if (!tokenWithUserAndRole) {
        throw TokenException.Revoked
      }

      // 3: Cập nhật device (ip và userAgent đều có thể bị thay đổi, ip thay đổi khi đổ i mạng, userAgent thay đổi khi browser tự update)
      const {
        deviceId,
        user: {
          role: { id: roleId, name: roleName },
        },
      } = tokenWithUserAndRole

      // 4 & 5: Xóa token cũ và tạo token mới song song (cả 2 đều critical)
      const [newTokens] = await Promise.all([
        this.authRepo.generateTokens({ userId, deviceId, roleId, roleName }),
        this.authRepo.revokeRefreshToken(refreshToken),
      ])

      // Cập nhật device không critical → fire-and-forget, không block response
      void this.authRepo.updateDevice({ id: deviceId, userAgent, ip, lastActive: new Date() })

      return newTokens
    } catch (error) {
      // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
      // refresh token của họ đã bị đánh cắp

      if (error instanceof HttpException) {
        throw error
      }

      throw new UnauthorizedException()
    }
  }

  async validateVerificationCode({
    email,
    code,
    type,
  }: {
    email: string
    code: string
    type: VerificationCodePurposeType
  }) {
    const vevificationCode = await this.authRepo.findVerificationCode({
      email,
      code,
      type,
    })
    if (!vevificationCode) {
      throw OtpException.Invalid
    }
    if (vevificationCode.expiresAt < new Date()) {
      throw OtpException.Expired
    }
    return vevificationCode
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, code, newPassword, confirmNewPassword } = body
    if (newPassword !== confirmNewPassword) {
      throw PasswordException.MismatchConfirm
    }

    await this.validateVerificationCode({ email, code, type: VerificationCodePurpose.FORGOT_PASSWORD })

    const hashedPassword = await this.hashingService.hash(newPassword)

    await this.authRepo.resetPassword({
      email,
      code,
      type: VerificationCodePurpose.FORGOT_PASSWORD,
      hashedPassword,
    })

    return { message: 'Password reset successfully' }
  }

  async logout(refreshToken: string) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ không
      await this.tokenService.verifyRefreshToken(refreshToken)
      // 2. Xóa refreshToken trong database
      const token = await this.authRepo.revokeRefreshToken(refreshToken)
      const { deviceId } = token
      await this.authRepo.updateDevice({ id: deviceId, isActive: false, lastActive: new Date() })
      return { message: 'Logout successfully' }
    } catch (error) {
      // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
      // refresh token của họ đã bị đánh cắp
      if (isNotFoundPrismaError(error)) {
        throw TokenException.Revoked
      }
      throw new UnauthorizedException()
    }
  }

  async sendOtp(body: SendOTPBodyType) {
    const { email, type } = body
    const user = await this.sharedRepo.findUser({ email })
    const isRegister = type === VerificationCodePurpose.REGISTER
    if (isRegister && user) {
      throw EmailException.Exists
    }
    if (!isRegister && (!user || !user.password)) {
      throw EmailException.Invalid
    }

    const otpCode = generateOTP()
    const expiresAt = new Date(Date.now() + ms(envConfig.OTP_EXPIRES as ms.StringValue))

    await this.authRepo.createVerificationCode({
      email,
      type,
      code: otpCode,
      expiresAt,
    })

    const expiresInMinutes = Math.floor(ms(envConfig.OTP_EXPIRES as ms.StringValue) / 60000)
    await this.emailService.sendOtp({
      email,
      code: otpCode,
      expiresInMinutes,
      type,
    })

    return { message: 'OTP sent successfully' }
  }
}
