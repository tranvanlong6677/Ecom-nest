import { Module } from '@nestjs/common'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'
import { PaymentRepository } from './payment.repo'
import { PaymentProducer } from './payment.producer'
import { PAYMENT_QUEUE_NAME } from '@/shared/constants/queue.constants'
import { BullModule } from '@nestjs/bullmq'

@Module({
  imports: [
    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME,
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, PaymentProducer],
})
export class PaymentModule {}
