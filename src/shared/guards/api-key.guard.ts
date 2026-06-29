import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'
import envConfig from '../config'

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const apiKey = request.headers['x-api-key']

    if (apiKey !== envConfig.SECRET_API_KEY) {
      throw new UnauthorizedException('Invalid API key')
    }

    return true
  }
}
