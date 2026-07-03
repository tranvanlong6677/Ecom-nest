import { Injectable } from '@nestjs/common'
import envConfig from '@/shared/config'
import { OAuthProvider } from '@/generated/prisma/client'
import { GITHUB_OAUTH_ENDPOINTS } from '@/routes/auth/oauth/oauth.constants'
import { NormalizedOAuthProfile, OAuthProviderAdapter } from './oauth-provider.interface'

interface GithubTokenResponse {
  access_token: string
}

interface GithubUserInfoResponse {
  id: number
  name?: string | null
  login: string
  avatar_url?: string
}

interface GithubEmailResponse {
  email: string
  primary: boolean
  verified: boolean
}

@Injectable()
export class GithubOAuthProvider implements OAuthProviderAdapter {
  readonly provider = OAuthProvider.GITHUB

  private readonly headers = {
    Accept: 'application/json',
    'User-Agent': GITHUB_OAUTH_ENDPOINTS.USER_AGENT,
  }

  buildAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: envConfig.GITHUB_CLIENT_ID,
      redirect_uri: envConfig.GITHUB_REDIRECT_URI,
      scope: GITHUB_OAUTH_ENDPOINTS.SCOPE,
      state,
    })
    return `${GITHUB_OAUTH_ENDPOINTS.AUTHORIZE_URL}?${params.toString()}`
  }

  async exchangeCodeForToken(code: string): Promise<{ accessToken: string }> {
    const response = await fetch(GITHUB_OAUTH_ENDPOINTS.TOKEN_URL, {
      method: 'POST',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: envConfig.GITHUB_CLIENT_ID,
        client_secret: envConfig.GITHUB_CLIENT_SECRET,
        redirect_uri: envConfig.GITHUB_REDIRECT_URI,
      }),
    })
    if (!response.ok) {
      throw new Error(`GitHub token exchange failed: ${response.status}`)
    }
    const data = (await response.json()) as GithubTokenResponse
    return { accessToken: data.access_token }
  }

  async fetchUserProfile(providerAccessToken: string): Promise<NormalizedOAuthProfile> {
    const authHeaders = { ...this.headers, Authorization: `Bearer ${providerAccessToken}` }

    const userResponse = await fetch(GITHUB_OAUTH_ENDPOINTS.USERINFO_URL, { headers: authHeaders })
    if (!userResponse.ok) {
      throw new Error(`GitHub userinfo fetch failed: ${userResponse.status}`)
    }
    const user = (await userResponse.json()) as GithubUserInfoResponse

    const email = await this.fetchPrimaryEmail(authHeaders)

    return {
      providerId: String(user.id),
      email,
      name: user.name || user.login,
      avatarUrl: user.avatar_url ?? null,
    }
  }

  private async fetchPrimaryEmail(authHeaders: Record<string, string>): Promise<string | null> {
    const emailsResponse = await fetch(GITHUB_OAUTH_ENDPOINTS.EMAILS_URL, { headers: authHeaders })
    if (!emailsResponse.ok) {
      return null
    }
    const emails = (await emailsResponse.json()) as GithubEmailResponse[]
    const primaryEmail = emails.find((e) => e.primary && e.verified)
    return primaryEmail?.email ?? null
  }
}
