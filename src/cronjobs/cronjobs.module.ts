import { Module } from '@nestjs/common'
import { RemoveRefreshTokenCronjob } from './remove-refresh-token.cronjob'
import { RemoveVerificationCodeCronjob } from './remove-verification-code.cronjob'

@Module({
  providers: [RemoveRefreshTokenCronjob, RemoveVerificationCodeCronjob],
})
export class CronjobsModule {}
