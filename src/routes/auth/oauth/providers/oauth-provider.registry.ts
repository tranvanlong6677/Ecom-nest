import { Injectable } from '@nestjs/common'
import { OAuthProvider } from '@/generated/prisma/client'
import { FacebookOAuthProvider } from './facebook.provider'
import { GithubOAuthProvider } from './github.provider'
import { GoogleOAuthProvider } from './google.provider'
import { OAuthProviderAdapter } from './oauth-provider.interface'

@Injectable()
export class OAuthProviderRegistry {
  private readonly adapters: Record<OAuthProvider, OAuthProviderAdapter>

  constructor(
    googleProvider: GoogleOAuthProvider,
    facebookProvider: FacebookOAuthProvider,
    githubProvider: GithubOAuthProvider,
  ) {
    this.adapters = {
      [OAuthProvider.GOOGLE]: googleProvider,
      [OAuthProvider.FACEBOOK]: facebookProvider,
      [OAuthProvider.GITHUB]: githubProvider,
    }
  }

  get(provider: OAuthProvider): OAuthProviderAdapter {
    return this.adapters[provider]
  }
}
