import { createZodDto } from 'nestjs-zod'
import {
  OAuthAuthorizeQuerySchema,
  OAuthCallbackQuerySchema,
  OAuthExchangeBodySchema,
  OAuthProviderParamSchema,
} from './oauth.model'

export class OAuthProviderParamDto extends createZodDto(OAuthProviderParamSchema) {}

export class OAuthAuthorizeQueryDto extends createZodDto(OAuthAuthorizeQuerySchema) {}

export class OAuthCallbackQueryDto extends createZodDto(OAuthCallbackQuerySchema) {}

export class OAuthExchangeBodyDto extends createZodDto(OAuthExchangeBodySchema) {}
