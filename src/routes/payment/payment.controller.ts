import { Controller, Post, Body } from '@nestjs/common'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { WebhookPaymentBodyDTO } from './payment.dto'
import { PaymentService } from './payment.service'
import { AuthGuard } from '@/shared/guards/auth.guard'
import { AuthOptionsType, AuthType } from '@/shared/enums/auth-type.enum'
import { Auth } from '@/shared/decorators/auth.decorator'

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/receiver')
  @ZodSerializerDto(MessageResDTO)
  //   @IsPublic()
  @Auth([AuthType.PaymentAPIKey], { condition: AuthOptionsType.AND })
  receiver(@Body() body: WebhookPaymentBodyDTO) {
    return this.paymentService.receiver(body)
  }
}
