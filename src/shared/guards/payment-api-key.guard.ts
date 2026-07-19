import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'
import envConfig from '@/shared/config'

@Injectable()
export class PaymentApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const apiKey = request.headers['payment-api-key']

    if (apiKey !== envConfig.PAYMENT_API_KEY) {
      throw new UnauthorizedException('Invalid API key')
    }

    return true
  }
}
