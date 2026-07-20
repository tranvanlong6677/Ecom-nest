import { Global, Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { AccessTokenGuard } from '@/shared/guards/access-token.guard'
import { PaymentApiKeyGuard } from '@/shared/guards/payment-api-key.guard'
import { AuthGuard } from '@/shared/guards/auth.guard'
import { HashingService } from '@/shared/services/hashing.service'
import { JwtService } from '@/shared/services/jwt.service'
import { PrismaService } from '@/shared/services/prisma.service'
import { TokenService } from '@/shared/services/token.service'
import { EmailService } from '@/shared/services/email.service'
import { S3Service } from '@/shared/services/s3.service'
import { SharedUserRepository } from '@/shared/repository/shared-user.repo'
import { CleanupTask } from '@/shared/tasks/cleanup.task'
import { TotpService } from './services/totp.service'
import { SharedPaymentRepository } from './repository/shared-payment.repo'

const sharedServices = [
  PrismaService,
  HashingService,
  JwtService,
  TokenService,
  EmailService,
  TotpService,
  S3Service,
  CleanupTask,
]
const sharedRepos = [SharedUserRepository, SharedPaymentRepository]
@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [
    ...sharedServices,
    ...sharedRepos,
    AccessTokenGuard,
    PaymentApiKeyGuard,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [...sharedServices, ...sharedRepos],
})
export class SharedModule {}
