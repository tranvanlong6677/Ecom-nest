import { Body, Controller, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common'
import { AuthService } from '@/routes/auth/auth.service'
import {
  LoginBodyDto,
  LoginResDTO,
  LogoutBodyDto,
  RefreshTokenBodyDto,
  RegisterBodyDto,
  RegisterResDTO,
  SendOTPBodyDto,
} from '@/routes/auth/auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserAgent } from '@/shared/decorators/user-agent.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDTO)
  async register(@Body() body: RegisterBodyDto) {
    return await this.authService.register(body)
  }

  @Post('send-otp')
  async sendOtp(@Body() body: SendOTPBodyDto) {
    return await this.authService.sendOtp(body)
  }

  @Post('login')
  @ZodSerializerDto(LoginResDTO)
  async login(@Body() body: LoginBodyDto, @UserAgent() userAgent, @Ip() ip) {
    return this.authService.login({ ...body, userAgent, ip })
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(LoginResDTO)
  async refreshToken(@Body() body: RefreshTokenBodyDto) {
    return this.authService.refreshToken(body.refreshToken)
  }

  @Post('logout')
  @ZodSerializerDto(LoginResDTO)
  async logout(@Body() body: LogoutBodyDto) {
    return this.authService.logout(body.refreshToken)
  }
}
