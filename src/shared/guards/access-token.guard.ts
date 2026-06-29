import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt'
import type { Request } from 'express'
import { REQUEST_USER_KEY } from '../constants/auth.constants'
import { JwtService } from '../services/jwt.service'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractToken(request)

    if (!token) {
      throw new UnauthorizedException('Access token is missing')
    }

    try {
      const payload = await this.jwtService.verifyAccessToken(token)
      request[REQUEST_USER_KEY] = payload
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token has expired')
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token signature')
      }
      throw new UnauthorizedException('Access token is invalid or expired')
    }

    return true
  }

  private extractToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : null
  }
}
