import { Global, Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { AccessTokenGuard } from './guards/access-token.guard'
import { ApiKeyGuard } from './guards/api-key.guard'
import { AuthGuard } from './guards/auth.guard'
import { HashingService } from './services/hashing.service'
import { JwtService } from './services/jwt.service'
import { PrismaService } from './services/prisma.service'
import { TokenService } from './services/token.service'

const sharedServices = [PrismaService, HashingService, JwtService, TokenService]

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [...sharedServices, AccessTokenGuard, ApiKeyGuard, { provide: APP_GUARD, useClass: AuthGuard }],
  exports: [...sharedServices],
})
export class SharedModule {}
