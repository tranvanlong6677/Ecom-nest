import { Injectable } from '@nestjs/common'
import envConfig from '@/shared/config'
import { OAuthProvider } from '@/generated/prisma/client'
import { FACEBOOK_OAUTH_ENDPOINTS } from '@/routes/auth/oauth/oauth.constants'
import { NormalizedOAuthProfile, OAuthProviderAdapter } from './oauth-provider.interface'

interface FacebookTokenResponse {
  access_token: string
}

interface FacebookUserInfoResponse {
  id: string
  email?: string
  name?: string
  picture?: { data?: { url?: string } }
}

@Injectable()
export class FacebookOAuthProvider implements OAuthProviderAdapter {
  readonly provider = OAuthProvider.FACEBOOK

  buildAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: envConfig.FACEBOOK_CLIENT_ID,
      redirect_uri: envConfig.FACEBOOK_REDIRECT_URI,
      response_type: 'code',
      scope: FACEBOOK_OAUTH_ENDPOINTS.SCOPE,
      state,
    })
    return `${FACEBOOK_OAUTH_ENDPOINTS.AUTHORIZE_URL}?${params.toString()}`
  }

  async exchangeCodeForToken(code: string): Promise<{ accessToken: string }> {
    const params = new URLSearchParams({
      code,
      client_id: envConfig.FACEBOOK_CLIENT_ID,
      client_secret: envConfig.FACEBOOK_CLIENT_SECRET,
      redirect_uri: envConfig.FACEBOOK_REDIRECT_URI,
    })
    const response = await fetch(`${FACEBOOK_OAUTH_ENDPOINTS.TOKEN_URL}?${params.toString()}`)
    if (!response.ok) {
      throw new Error(`Facebook token exchange failed: ${response.status}`)
    }
    const data = (await response.json()) as FacebookTokenResponse
    return { accessToken: data.access_token }
  }

  async fetchUserProfile(providerAccessToken: string): Promise<NormalizedOAuthProfile> {
    const params = new URLSearchParams({
      fields: 'id,name,email,picture',
      access_token: providerAccessToken,
    })
    const response = await fetch(`${FACEBOOK_OAUTH_ENDPOINTS.USERINFO_URL}?${params.toString()}`)
    if (!response.ok) {
      throw new Error(`Facebook userinfo fetch failed: ${response.status}`)
    }
    const data = (await response.json()) as FacebookUserInfoResponse
    return {
      providerId: data.id,
      email: data.email ?? null,
      name: data.name ?? '',
      avatarUrl: data.picture?.data?.url ?? null,
    }
  }
}
