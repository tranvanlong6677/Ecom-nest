import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'
import envConfig from '@/shared/config'

@Injectable()
export class PaymentApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>() as any
    const apiKey = request.headers['Authorization']?.split(' ')[1]

    if (apiKey !== envConfig.PAYMENT_API_KEY) {
      throw new UnauthorizedException('Invalid API key')
    }

    return true
  }
}
