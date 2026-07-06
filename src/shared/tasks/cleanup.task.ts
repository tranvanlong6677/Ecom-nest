import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '@/shared/services/prisma.service'

@Injectable()
export class CleanupTask {
  constructor(private readonly prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteExpiredVerificationCodes() {
    console.log('clean up verification code')
    await this.prismaService.verificationCode.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
  }
}
