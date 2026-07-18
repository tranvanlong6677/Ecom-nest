import { Injectable } from '@nestjs/common'
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model'
import { PaymentRepository } from './payment.repo'

@Injectable()
export class PaymentService {
    constructor(private readonly paymentRepo: PaymentRepository) { }

    receiver(body: WebhookPaymentBodyType) {
        return this.paymentRepo.receiver(body)
    }
}