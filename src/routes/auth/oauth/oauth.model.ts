import { z } from 'zod'

export const OAuthProviderParamSchema = z
  .object({
    provider: z.enum(['google', 'facebook', 'github']),
  })
  .strict()

export const OAuthAuthorizeQuerySchema = z
  .object({
    redirectUri: z.url().optional(),
  })
  .strict()

// Not .strict(): providers echo back extra query params we don't ask for
// (Google adds scope/authuser/prompt/iss, Facebook/GitHub have their own extras).
// Unknown keys are silently dropped rather than rejected.
export const OAuthCallbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
})

export const OAuthExchangeBodySchema = z
  .object({
    code: z.string().min(1),
  })
  .strict()

export type OAuthProviderParamType = z.infer<typeof OAuthProviderParamSchema>

export type OAuthAuthorizeQueryType = z.infer<typeof OAuthAuthorizeQuerySchema>

export type OAuthCallbackQueryType = z.infer<typeof OAuthCallbackQuerySchema>

export type OAuthExchangeBodyType = z.infer<typeof OAuthExchangeBodySchema>
