import { Global, Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { AccessTokenGuard } from '@/shared/guards/access-token.guard'
import { ApiKeyGuard } from '@/shared/guards/api-key.guard'
import { AuthGuard } from '@/shared/guards/auth.guard'
import { HashingService } from '@/shared/services/hashing.service'
import { JwtService } from '@/shared/services/jwt.service'
import { PrismaService } from '@/shared/services/prisma.service'
import { TokenService } from '@/shared/services/token.service'

const sharedServices = [PrismaService, HashingService, JwtService, TokenService]

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [...sharedServices, AccessTokenGuard, ApiKeyGuard, { provide: APP_GUARD, useClass: AuthGuard }],
  exports: [...sharedServices],
})
export class SharedModule {}
