import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { OAuthProvider } from '@/generated/prisma/client'
import { AuthRepository } from '@/routes/auth/auth.repo'
import { RolesService } from '@/routes/auth/role.service'
import { SharedRepository } from '@/shared/repository/shared-user.repo'
import { OAuthExchangeService } from './oauth-exchange.service'
import { OAuthStateService } from './oauth-state.service'
import { OAuthService } from './oauth.service'
import { OAuthRepository } from './oauth.repo'
import { OAuthProviderAdapter } from './providers/oauth-provider.interface'
import { OAuthProviderRegistry } from './providers/oauth-provider.registry'

jest.mock('@/shared/config', () => ({
  __esModule: true,
  default: {
    OAUTH_ALLOWED_REDIRECT_URIS: 'https://app.example.com/callback',
    OAUTH_DEFAULT_REDIRECT_URI: 'https://app.example.com/callback',
  },
}))

function buildService() {
  const authRepo = {
    createDevice: jest.fn(),
    findUserWithRole: jest.fn(),
    generateTokens: jest.fn(),
  } as unknown as jest.Mocked<AuthRepository>

  const oauthRepo = {
    findUserProvider: jest.fn(),
    createUserProvider: jest.fn(),
    createOAuthUser: jest.fn(),
  } as unknown as jest.Mocked<OAuthRepository>

  const sharedRepo = {
    findUser: jest.fn(),
  } as unknown as jest.Mocked<SharedRepository>

  const rolesService = {
    getClientRoleId: jest.fn(),
  } as unknown as jest.Mocked<RolesService>

  const googleAdapter: jest.Mocked<OAuthProviderAdapter> = {
    provider: OAuthProvider.GOOGLE,
    buildAuthorizeUrl: jest.fn(),
    exchangeCodeForToken: jest.fn(),
    fetchUserProfile: jest.fn(),
  }

  const providerRegistry = {
    get: jest.fn().mockReturnValue(googleAdapter),
  } as unknown as jest.Mocked<OAuthProviderRegistry>

  const oauthStateService = {
    generate: jest.fn(),
    consume: jest.fn(),
    sweepExpired: jest.fn(),
  } as unknown as jest.Mocked<OAuthStateService>

  const oauthExchangeService = {
    save: jest.fn(),
    consume: jest.fn(),
    sweepExpired: jest.fn(),
  } as unknown as jest.Mocked<OAuthExchangeService>

  const service = new OAuthService(
    authRepo,
    oauthRepo,
    sharedRepo,
    rolesService,
    providerRegistry,
    oauthStateService,
    oauthExchangeService,
  )

  return {
    service,
    authRepo,
    oauthRepo,
    sharedRepo,
    rolesService,
    providerRegistry,
    googleAdapter,
    oauthStateService,
    oauthExchangeService,
  }
}

describe('OAuthService', () => {
  describe('buildAuthorizeUrl', () => {
    it('throws BadRequestException when redirectUri is not allowlisted', () => {
      const { service } = buildService()
      expect(() => service.buildAuthorizeUrl('google', 'https://evil.com/steal')).toThrow(BadRequestException)
    })

    it('falls back to OAUTH_DEFAULT_REDIRECT_URI when redirectUri is omitted', () => {
      const { service, oauthStateService, googleAdapter } = buildService()
      oauthStateService.generate.mockReturnValue('state-123')
      googleAdapter.buildAuthorizeUrl.mockReturnValue('https://accounts.google.com/authorize?state=state-123')

      service.buildAuthorizeUrl('google')

      expect(oauthStateService.generate).toHaveBeenCalledWith({
        provider: OAuthProvider.GOOGLE,
        redirectUri: 'https://app.example.com/callback',
      })
    })

    it('returns the adapter authorize url built from the generated state', () => {
      const { service, oauthStateService, googleAdapter } = buildService()
      oauthStateService.generate.mockReturnValue('state-abc')
      googleAdapter.buildAuthorizeUrl.mockReturnValue('https://accounts.google.com/authorize?state=state-abc')

      const url = service.buildAuthorizeUrl('google', 'https://app.example.com/callback')

      expect(googleAdapter.buildAuthorizeUrl).toHaveBeenCalledWith('state-abc')
      expect(url).toBe('https://accounts.google.com/authorize?state=state-abc')
    })
  })

  describe('handleCallback', () => {
    it('redirects with invalid_state when state is missing', async () => {
      const { service, googleAdapter } = buildService()

      const url = await service.handleCallback({
        provider: 'google',
        code: 'code-1',
        userAgent: 'jest',
        ip: '127.0.0.1',
      })

      expect(url).toBe('https://app.example.com/callback?error=invalid_state')
      expect(googleAdapter.exchangeCodeForToken).not.toHaveBeenCalled()
    })

    it('redirects with invalid_state when state was already consumed / expired', async () => {
      const { service, oauthStateService } = buildService()
      oauthStateService.consume.mockReturnValue(null)

      const url = await service.handleCallback({
        provider: 'google',
        code: 'code-1',
        state: 'stale-state',
        userAgent: 'jest',
        ip: '127.0.0.1',
      })

      expect(url).toBe('https://app.example.com/callback?error=invalid_state')
    })

    it('redirects with invalid_state when the state was minted for a different provider', async () => {
      const { service, oauthStateService, googleAdapter } = buildService()
      oauthStateService.consume.mockReturnValue({
        provider: OAuthProvider.FACEBOOK,
        redirectUri: 'https://app.example.com/callback',
      })

      const url = await service.handleCallback({
        provider: 'google',
        code: 'code-1',
        state: 'state-1',
        userAgent: 'jest',
        ip: '127.0.0.1',
      })

      expect(url).toBe('https://app.example.com/callback?error=invalid_state')
      expect(googleAdapter.exchangeCodeForToken).not.toHaveBeenCalled()
    })

    it('redirects with the provider error and short-circuits before touching the adapter', async () => {
      const { service, oauthStateService, googleAdapter } = buildService()
      oauthStateService.consume.mockReturnValue({
        provider: OAuthProvider.GOOGLE,
        redirectUri: 'https://app.example.com/callback',
      })

      const url = await service.handleCallback({
        provider: 'google',
        state: 'state-1',
        error: 'access_denied',
        userAgent: 'jest',
        ip: '127.0.0.1',
      })

      expect(url).toBe('https://app.example.com/callback?error=access_denied')
      expect(googleAdapter.exchangeCodeForToken).not.toHaveBeenCalled()
    })

    it('redirects with missing_code when no code and no provider error are present', async () => {
      const { service, oauthStateService } = buildService()
      oauthStateService.consume.mockReturnValue({
        provider: OAuthProvider.GOOGLE,
        redirectUri: 'https://app.example.com/callback',
      })

      const url = await service.handleCallback({
        provider: 'google',
        state: 'state-1',
        userAgent: 'jest',
        ip: '127.0.0.1',
      })

      expect(url).toBe('https://app.example.com/callback?error=missing_code')
    })

    it('happy path: creates a new user, issues tokens, and returns an opaque exchange code (never raw tokens)', async () => {
      const {
        service,
        oauthStateService,
        googleAdapter,
        oauthRepo,
        sharedRepo,
        rolesService,
        authRepo,
        oauthExchangeService,
      } = buildService()

      oauthStateService.consume.mockReturnValue({
        provider: OAuthProvider.GOOGLE,
        redirectUri: 'https://app.example.com/callback',
      })
      googleAdapter.exchangeCodeForToken.mockResolvedValue({ accessToken: 'provider-access-token' })
      googleAdapter.fetchUserProfile.mockResolvedValue({
        providerId: 'google-123',
        email: 'new-user@example.com',
        name: 'New User',
        avatarUrl: null,
      })
      oauthRepo.findUserProvider.mockResolvedValue(null)
      sharedRepo.findUser.mockResolvedValue(null)
      rolesService.getClientRoleId.mockResolvedValue(7)
      oauthRepo.createOAuthUser.mockResolvedValue({ id: 1, roleId: 7 } as any)
      authRepo.createDevice.mockResolvedValue({ id: 55 } as any)
      authRepo.findUserWithRole.mockResolvedValue({ id: 1, roleId: 7, role: { name: 'CLIENT' } } as any)
      authRepo.generateTokens.mockResolvedValue({ accessToken: 'access.jwt', refreshToken: 'refresh.jwt' })
      oauthExchangeService.save.mockReturnValue('opaque-exchange-code')

      const url = await service.handleCallback({
        provider: 'google',
        code: 'auth-code',
        state: 'state-1',
        userAgent: 'jest',
        ip: '127.0.0.1',
      })

      expect(oauthRepo.createOAuthUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new-user@example.com', roleId: 7, provider: OAuthProvider.GOOGLE }),
      )
      expect(authRepo.createDevice).toHaveBeenCalledWith({ userId: 1, userAgent: 'jest', ip: '127.0.0.1' })
      expect(authRepo.generateTokens).toHaveBeenCalledWith({
        userId: 1,
        roleId: 7,
        deviceId: 55,
        roleName: 'CLIENT',
      })
      expect(oauthExchangeService.save).toHaveBeenCalledWith({ accessToken: 'access.jwt', refreshToken: 'refresh.jwt' })
      expect(url).toBe('https://app.example.com/callback?code=opaque-exchange-code')
      expect(url).not.toContain('access.jwt')
      expect(url).not.toContain('refresh.jwt')
    })

    it('happy path: returning OAuth user is looked up by provider link, no new user or link is created', async () => {
      const { service, oauthStateService, googleAdapter, oauthRepo, authRepo, oauthExchangeService } = buildService()

      oauthStateService.consume.mockReturnValue({
        provider: OAuthProvider.GOOGLE,
        redirectUri: 'https://app.example.com/callback',
      })
      googleAdapter.exchangeCodeForToken.mockResolvedValue({ accessToken: 'provider-access-token' })
      googleAdapter.fetchUserProfile.mockResolvedValue({
        providerId: 'google-123',
        email: 'returning@example.com',
        name: 'Returning User',
        avatarUrl: null,
      })
      oauthRepo.findUserProvider.mockResolvedValue({ user: { id: 42, roleId: 3 } as any })
      authRepo.createDevice.mockResolvedValue({ id: 9 } as any)
      authRepo.findUserWithRole.mockResolvedValue({ id: 42, roleId: 3, role: { name: 'CLIENT' } } as any)
      authRepo.generateTokens.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' })
      oauthExchangeService.save.mockReturnValue('code-2')

      await service.handleCallback({
        provider: 'google',
        code: 'auth-code',
        state: 'state-1',
        userAgent: 'jest',
        ip: '127.0.0.1',
      })

      expect(oauthRepo.createOAuthUser).not.toHaveBeenCalled()
      expect(oauthRepo.createUserProvider).not.toHaveBeenCalled()
      expect(authRepo.createDevice).toHaveBeenCalledWith({ userId: 42, userAgent: 'jest', ip: '127.0.0.1' })
    })

    it('links the OAuth identity to an existing password-based account matched by email', async () => {
      const { service, oauthStateService, googleAdapter, oauthRepo, sharedRepo, authRepo, oauthExchangeService } =
        buildService()

      oauthStateService.consume.mockReturnValue({
        provider: OAuthProvider.GOOGLE,
        redirectUri: 'https://app.example.com/callback',
      })
      googleAdapter.exchangeCodeForToken.mockResolvedValue({ accessToken: 'provider-access-token' })
      googleAdapter.fetchUserProfile.mockResolvedValue({
        providerId: 'google-999',
        email: 'existing@example.com',
        name: 'Existing User',
        avatarUrl: null,
      })
      oauthRepo.findUserProvider.mockResolvedValue(null)
      sharedRepo.findUser.mockResolvedValue({ id: 10, roleId: 2 } as any)
      authRepo.createDevice.mockResolvedValue({ id: 5 } as any)
      authRepo.findUserWithRole.mockResolvedValue({ id: 10, roleId: 2, role: { name: 'CLIENT' } } as any)
      authRepo.generateTokens.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' })
      oauthExchangeService.save.mockReturnValue('code-3')

      await service.handleCallback({
        provider: 'google',
        code: 'auth-code',
        state: 'state-1',
        userAgent: 'jest',
        ip: '127.0.0.1',
      })

      expect(oauthRepo.createUserProvider).toHaveBeenCalledWith({
        userId: 10,
        provider: OAuthProvider.GOOGLE,
        providerId: 'google-999',
        email: 'existing@example.com',
      })
      expect(oauthRepo.createOAuthUser).not.toHaveBeenCalled()
    })

    it('redirects with email_not_available when the provider gives no email and there is no existing link', async () => {
      const { service, oauthStateService, googleAdapter, oauthRepo } = buildService()

      oauthStateService.consume.mockReturnValue({
        provider: OAuthProvider.GOOGLE,
        redirectUri: 'https://app.example.com/callback',
      })
      googleAdapter.exchangeCodeForToken.mockResolvedValue({ accessToken: 'provider-access-token' })
      googleAdapter.fetchUserProfile.mockResolvedValue({
        providerId: 'google-777',
        email: null,
        name: 'No Email',
        avatarUrl: null,
      })
      oauthRepo.findUserProvider.mockResolvedValue(null)

      const url = await service.handleCallback({
        provider: 'google',
        code: 'auth-code',
        state: 'state-1',
        userAgent: 'jest',
        ip: '127.0.0.1',
      })

      expect(url).toBe('https://app.example.com/callback?error=email_not_available')
    })

    it('redirects with oauth_failed when the provider adapter throws unexpectedly', async () => {
      const { service, oauthStateService, googleAdapter } = buildService()
      oauthStateService.consume.mockReturnValue({
        provider: OAuthProvider.GOOGLE,
        redirectUri: 'https://app.example.com/callback',
      })
      googleAdapter.exchangeCodeForToken.mockRejectedValue(new Error('network down'))

      const url = await service.handleCallback({
        provider: 'google',
        code: 'auth-code',
        state: 'state-1',
        userAgent: 'jest',
        ip: '127.0.0.1',
      })

      expect(url).toBe('https://app.example.com/callback?error=oauth_failed')
    })
  })

  describe('exchangeCode', () => {
    it('returns tokens for a valid code and consumes it exactly once', () => {
      const { service, oauthExchangeService } = buildService()
      oauthExchangeService.consume.mockReturnValue({ accessToken: 'a', refreshToken: 'r' })

      const tokens = service.exchangeCode('valid-code')

      expect(tokens).toEqual({ accessToken: 'a', refreshToken: 'r' })
      expect(oauthExchangeService.consume).toHaveBeenCalledWith('valid-code')
    })

    it('throws UnauthorizedException for an unknown or expired code', () => {
      const { service, oauthExchangeService } = buildService()
      oauthExchangeService.consume.mockReturnValue(null)

      expect(() => service.exchangeCode('bad-code')).toThrow(UnauthorizedException)
    })
  })
})
