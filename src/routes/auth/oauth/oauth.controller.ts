import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Param, Post, Query, Res } from '@nestjs/common'
import type { Response } from 'express'
import { ZodSerializerDto } from 'nestjs-zod'
import { LoginResDTO } from '@/routes/auth/auth.dto'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { UserAgent } from '@/shared/decorators/user-agent.decorator'
import { OAuthService } from './oauth.service'
import { OAuthAuthorizeQueryDto, OAuthCallbackQueryDto, OAuthExchangeBodyDto, OAuthProviderParamDto } from './oauth.dto'

@Controller('auth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  // authorize/callback bypass ZodSerializerDto/TransformInterceptor on purpose — they
  // redirect the browser rather than return JSON.
  @Get(':provider')
  @IsPublic()
  authorize(@Param() params: OAuthProviderParamDto, @Query() query: OAuthAuthorizeQueryDto, @Res() res: Response) {
    const url = this.oauthService.buildAuthorizeUrl(params.provider, query.redirectUri)
    return res.redirect(HttpStatus.FOUND, url)
  }

  @Get(':provider/callback')
  @IsPublic()
  async callback(
    @Param() params: OAuthProviderParamDto,
    @Query() query: OAuthCallbackQueryDto,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.oauthService.handleCallback({ provider: params.provider, ...query, userAgent, ip })
    return res.redirect(HttpStatus.FOUND, redirectUrl)
  }

  @Post('oauth/exchange')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(LoginResDTO)
  exchange(@Body() body: OAuthExchangeBodyDto) {
    return this.oauthService.exchangeCode(body.code)
  }
}
