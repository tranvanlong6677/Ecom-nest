import { Injectable } from '@nestjs/common'
import envConfig from '@/shared/config'
import { OAuthProvider } from '@/generated/prisma/client'
import { GOOGLE_OAUTH_ENDPOINTS } from '@/routes/auth/oauth/oauth.constants'
import { NormalizedOAuthProfile, OAuthProviderAdapter } from './oauth-provider.interface'

interface GoogleTokenResponse {
  access_token: string
}

interface GoogleUserInfoResponse {
  sub: string
  email?: string
  name?: string
  picture?: string
}

@Injectable()
export class GoogleOAuthProvider implements OAuthProviderAdapter {
  readonly provider = OAuthProvider.GOOGLE

  buildAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: envConfig.GOOGLE_CLIENT_ID,
      redirect_uri: envConfig.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: GOOGLE_OAUTH_ENDPOINTS.SCOPE,
      state,
    })
    return `${GOOGLE_OAUTH_ENDPOINTS.AUTHORIZE_URL}?${params.toString()}`
  }

  async exchangeCodeForToken(code: string): Promise<{ accessToken: string }> {
    const response = await fetch(GOOGLE_OAUTH_ENDPOINTS.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: envConfig.GOOGLE_CLIENT_ID,
        client_secret: envConfig.GOOGLE_CLIENT_SECRET,
        redirect_uri: envConfig.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })
    if (!response.ok) {
      throw new Error(`Google token exchange failed: ${response.status}`)
    }
    const data = (await response.json()) as GoogleTokenResponse
    return { accessToken: data.access_token }
  }

  async fetchUserProfile(providerAccessToken: string): Promise<NormalizedOAuthProfile> {
    const response = await fetch(GOOGLE_OAUTH_ENDPOINTS.USERINFO_URL, {
      headers: { Authorization: `Bearer ${providerAccessToken}` },
    })
    if (!response.ok) {
      throw new Error(`Google userinfo fetch failed: ${response.status}`)
    }
    const data = (await response.json()) as GoogleUserInfoResponse
    return {
      providerId: data.sub,
      email: data.email ?? null,
      name: data.name ?? '',
      avatarUrl: data.picture ?? null,
    }
  }
}
