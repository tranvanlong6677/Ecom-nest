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
import { EmailService } from '@/shared/services/email.service'
import { SharedUserRepository } from '@/shared/repository/shared-user.repo'
import { CleanupTask } from '@/shared/tasks/cleanup.task'
import { TotpService } from './services/totp.service'

const sharedServices = [PrismaService, HashingService, JwtService, TokenService, EmailService, TotpService]
const sharedRepos = [SharedUserRepository]
const sharedTasks = [CleanupTask]
@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [
    ...sharedServices,
    ...sharedRepos,
    ...sharedTasks,
    AccessTokenGuard,
    ApiKeyGuard,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [...sharedServices, ...sharedRepos],
})
export class SharedModule {}
