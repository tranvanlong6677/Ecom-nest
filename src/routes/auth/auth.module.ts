import { Module } from '@nestjs/common'
import { AuthService } from '@/routes/auth/auth.service'
import { AuthController } from '@/routes/auth/auth.controller'
import { RolesService } from '@/routes/auth/role.service'
import { AuthRepository } from './auth.repo'
import { OAuthCleanupTask } from './oauth/oauth-cleanup.task'
import { OAuthExchangeService } from './oauth/oauth-exchange.service'
import { OAuthStateService } from './oauth/oauth-state.service'
import { OAuthController } from './oauth/oauth.controller'
import { OAuthRepository } from './oauth/oauth.repo'
import { OAuthService } from './oauth/oauth.service'
import { FacebookOAuthProvider } from './oauth/providers/facebook.provider'
import { GithubOAuthProvider } from './oauth/providers/github.provider'
import { GoogleOAuthProvider } from './oauth/providers/google.provider'
import { OAuthProviderRegistry } from './oauth/providers/oauth-provider.registry'

@Module({
  controllers: [AuthController, OAuthController],
  providers: [
    AuthService,
    RolesService,
    AuthRepository,
    OAuthService,
    OAuthRepository,
    OAuthStateService,
    OAuthExchangeService,
    OAuthCleanupTask,
    OAuthProviderRegistry,
    GoogleOAuthProvider,
    FacebookOAuthProvider,
    GithubOAuthProvider,
  ],
})
export class AuthModule {}
