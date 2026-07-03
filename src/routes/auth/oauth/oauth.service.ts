import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { OAuthProvider } from '@/generated/prisma/client'
import { AuthRepository } from '@/routes/auth/auth.repo'
import { RolesService } from '@/routes/auth/role.service'
import envConfig from '@/shared/config'
import { SharedRepository } from '@/shared/repository/shared-user.repo'
import { LoginResType } from '@/routes/auth/auth.model'
import { OAuthExchangeService } from './oauth-exchange.service'
import { OAuthFlowError } from './oauth-flow.error'
import { OAuthStateService } from './oauth-state.service'
import { OAUTH_PROVIDER_PARAM_MAP } from './oauth.constants'
import { OAuthProviderParamType } from './oauth.model'
import { OAuthRepository } from './oauth.repo'
import { NormalizedOAuthProfile } from './providers/oauth-provider.interface'
import { OAuthProviderRegistry } from './providers/oauth-provider.registry'

interface HandleCallbackInput {
  provider: OAuthProviderParamType['provider']
  code?: string
  state?: string
  error?: string
  userAgent: string
  ip: string
}

@Injectable()
export class OAuthService {
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly oauthRepo: OAuthRepository,
    private readonly sharedRepo: SharedRepository,
    private readonly rolesService: RolesService,
    private readonly providerRegistry: OAuthProviderRegistry,
    private readonly oauthStateService: OAuthStateService,
    private readonly oauthExchangeService: OAuthExchangeService,
  ) {}

  buildAuthorizeUrl(providerParam: OAuthProviderParamType['provider'], redirectUri?: string): string {
    const provider = OAUTH_PROVIDER_PARAM_MAP[providerParam]
    const resolvedRedirectUri = redirectUri ?? envConfig.OAUTH_DEFAULT_REDIRECT_URI
    const allowedRedirectUris = envConfig.OAUTH_ALLOWED_REDIRECT_URIS.split(',').map((uri) => uri.trim())

    if (!allowedRedirectUris.includes(resolvedRedirectUri)) {
      throw new BadRequestException('redirectUri is not allowed')
    }

    const state = this.oauthStateService.generate({ provider, redirectUri: resolvedRedirectUri })
    return this.providerRegistry.get(provider).buildAuthorizeUrl(state)
  }

  // Must never throw — the caller is mid-redirect from the user's browser, so any
  // failure has to resolve to a redirect URL (carrying an `?error=` code) rather than
  // letting an exception escape to a raw JSON error response.
  async handleCallback(input: HandleCallbackInput): Promise<string> {
    const provider = OAUTH_PROVIDER_PARAM_MAP[input.provider]
    const stateValue = input.state ? this.oauthStateService.consume(input.state) : null

    if (!stateValue || stateValue.provider !== provider) {
      return this.buildErrorRedirect(envConfig.OAUTH_DEFAULT_REDIRECT_URI, 'invalid_state')
    }

    const { redirectUri } = stateValue

    if (input.error) {
      return this.buildErrorRedirect(redirectUri, input.error)
    }
    if (!input.code) {
      return this.buildErrorRedirect(redirectUri, 'missing_code')
    }

    try {
      const adapter = this.providerRegistry.get(provider)
      const { accessToken: providerAccessToken } = await adapter.exchangeCodeForToken(input.code)
      const profile = await adapter.fetchUserProfile(providerAccessToken)
      const user = await this.findOrCreateUser(provider, profile)

      const device = await this.authRepo.createDevice({ userId: user.id, userAgent: input.userAgent, ip: input.ip })
      const userWithRole = await this.authRepo.findUserWithRole({ id: user.id })
      if (!userWithRole) {
        return this.buildErrorRedirect(redirectUri, 'oauth_failed')
      }

      const tokens = await this.authRepo.generateTokens({
        userId: user.id,
        roleId: user.roleId,
        deviceId: device.id,
        roleName: userWithRole.role.name,
      })

      const exchangeCode = this.oauthExchangeService.save(tokens)
      return `${redirectUri}?code=${exchangeCode}`
    } catch (error) {
      const errorCode = error instanceof OAuthFlowError ? error.code : 'oauth_failed'
      return this.buildErrorRedirect(redirectUri, errorCode)
    }
  }

  exchangeCode(code: string): LoginResType {
    const tokens = this.oauthExchangeService.consume(code)
    if (!tokens) {
      throw new UnauthorizedException('OAuth exchange code is invalid or expired')
    }
    return tokens
  }

  private async findOrCreateUser(provider: OAuthProvider, profile: NormalizedOAuthProfile) {
    const existingLink = await this.oauthRepo.findUserProvider(provider, profile.providerId)
    if (existingLink) {
      return existingLink.user
    }

    if (!profile.email) {
      throw new OAuthFlowError('email_not_available')
    }

    const existingUser = await this.sharedRepo.findUser({ email: profile.email })
    if (existingUser) {
      await this.oauthRepo.createUserProvider({
        userId: existingUser.id,
        provider,
        providerId: profile.providerId,
        email: profile.email,
      })
      return existingUser
    }

    const clientRoleId = await this.rolesService.getClientRoleId()
    return await this.oauthRepo.createOAuthUser({
      email: profile.email,
      name: profile.name || profile.email.split('@')[0],
      avatar: profile.avatarUrl,
      roleId: clientRoleId,
      provider,
      providerId: profile.providerId,
    })
  }

  private buildErrorRedirect(redirectUri: string, errorCode: string): string {
    const url = new URL(redirectUri)
    url.searchParams.set('error', errorCode)
    return url.toString()
  }
}
