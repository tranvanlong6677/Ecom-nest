import { OAuthProvider } from '@/generated/prisma/client'

export interface NormalizedOAuthProfile {
  providerId: string
  email: string | null
  name: string
  avatarUrl: string | null
}

export interface OAuthProviderAdapter {
  readonly provider: OAuthProvider
  buildAuthorizeUrl(state: string): string
  exchangeCodeForToken(code: string): Promise<{ accessToken: string }>
  fetchUserProfile(providerAccessToken: string): Promise<NormalizedOAuthProfile>
}
