import { Body, Controller, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common'
import { AuthService } from '@/routes/auth/auth.service'
import {
  DisableTwoFactorBodyDTO,
  ForgotPasswordBodyDto,
  LoginBodyDto,
  LoginResDTO,
  LogoutBodyDto,
  RefreshTokenBodyDto,
  RefreshTokenResDTO,
  RegisterBodyDto,
  RegisterResDTO,
  SendOTPBodyDto,
  TwoFactorSetupResDTO,
} from '@/routes/auth/auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserAgent } from '@/shared/decorators/user-agent.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { Throttle } from '@nestjs/throttler'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { EmptyBodyDTO } from '@/shared/dtos/request.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @IsPublic()
  @ZodSerializerDto(RegisterResDTO)
  register(@Body() body: RegisterBodyDto) {
    return this.authService.register(body)
  }

  @Post('send-otp')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResDTO)
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  sendOtp(@Body() body: SendOTPBodyDto) {
    return this.authService.sendOtp(body)
  }

  @Post('login')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(LoginResDTO)
  login(@Body() body: LoginBodyDto, @UserAgent() userAgent, @Ip() ip) {
    return this.authService.login({ ...body, userAgent, ip })
  }

  @Post('refresh-token')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResDTO)
  refreshToken(@Body() body: RefreshTokenBodyDto, @UserAgent() userAgent, @Ip() ip) {
    return this.authService.refreshToken({ refreshToken: body.refreshToken, userAgent, ip })
  }

  @Post('forgot-password')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResDTO)
  @Throttle({ default: { limit: 10, ttl: 300000 } })
  forgotPassword(@Body() body: ForgotPasswordBodyDto) {
    return this.authService.forgotPassword(body)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResDTO)
  logout(@Body() body: LogoutBodyDto) {
    return this.authService.logout(body.refreshToken)
  }

  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResDTO)
  disable2FA(@Body() body: DisableTwoFactorBodyDTO, @ActiveUser('userId') userId: number) {
    return this.authService.disableTwoFactor({ userId, body })
  }

  @Post('2fa/setup')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(TwoFactorSetupResDTO)
  setup2FA(@Body() _: EmptyBodyDTO, @ActiveUser('userId') userId: number) {
    return this.authService.setupTwoFactor(userId)
  }
}
