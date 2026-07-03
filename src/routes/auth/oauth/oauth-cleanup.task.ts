import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { OAuthExchangeService } from '@/routes/auth/oauth/oauth-exchange.service'
import { OAuthStateService } from '@/routes/auth/oauth/oauth-state.service'

@Injectable()
export class OAuthCleanupTask {
  constructor(
    private readonly oauthStateService: OAuthStateService,
    private readonly oauthExchangeService: OAuthExchangeService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  sweepExpiredEntries() {
    this.oauthStateService.sweepExpired()
    this.oauthExchangeService.sweepExpired()
  }
}
