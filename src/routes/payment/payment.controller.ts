import { Controller, Post, Body } from '@nestjs/common'
import { WebhookPaymentBodyDTO } from './payment.dto'
import { PaymentService } from './payment.service'
import { AuthOptionsType, AuthType } from '@/shared/enums/auth-type.enum'
import { Auth } from '@/shared/decorators/auth.decorator'

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/receiver')
  //   @IsPublic()
  @Auth([AuthType.PaymentAPIKey], { condition: AuthOptionsType.AND })
  receiver(@Body() body: WebhookPaymentBodyDTO) {
    return this.paymentService.receiver(body)
  }
}
