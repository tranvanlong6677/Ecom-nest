import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '@/shared/services/prisma.service'

@Injectable()
export class RemoveVerificationCodeCronjob {
  private readonly logger = new Logger(RemoveVerificationCodeCronjob.name)
  constructor(private readonly prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM, { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleCron() {
    const result = await this.prismaService.verificationCode.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    })
    this.logger.log(`Removed ${result.count} expired verification codes.`)
  }
}
