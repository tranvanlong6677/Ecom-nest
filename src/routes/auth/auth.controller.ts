import { Body, Controller, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common'
import { AuthService } from '@/routes/auth/auth.service'
import {
  LoginBodyDto,
  LoginResDTO,
  LogoutBodyDto,
  RefreshTokenBodyDto,
  RefreshTokenResDTO,
  RegisterBodyDto,
  RegisterResDTO,
  SendOTPBodyDto,
} from '@/routes/auth/auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserAgent } from '@/shared/decorators/user-agent.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { IsPublic } from '@/shared/decorators/auth.decorator'

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

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResDTO)
  logout(@Body() body: LogoutBodyDto) {
    return this.authService.logout(body.refreshToken)
  }
}
