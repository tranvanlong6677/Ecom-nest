import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AUTH_TYPE_KEY } from '@/shared/decorators/auth.decorator'
import { AuthOptionsType, AuthType } from '@/shared/enums/auth-type.enum'
import { AccessTokenGuard } from '@/shared/guards/access-token.guard'
import { PaymentApiKeyGuard } from '@/shared/guards/payment-api-key.guard'
import { TokenException } from '@/shared/models/error.model'

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<AuthType, CanActivate>

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly paymentApiKeyGuard: PaymentApiKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.PaymentAPIKey]: this.paymentApiKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    }
  }

  private extractAuthMetadata(context: ExecutionContext) {
    return this.reflector.getAllAndOverride<{
      authTypes: AuthType[]
      condition: 'or' | 'and'
    }>(AUTH_TYPE_KEY, [context.getHandler(), context.getClass()])
  }

  private async handleOrCondition(guards: CanActivate[], context: ExecutionContext) {
    let lastError: unknown = TokenException.AccessTokenInvalid

    for (const guard of guards) {
      try {
        if (await guard.canActivate(context)) {
          return true
        }
      } catch (error) {
        lastError = error
      }
    }
    if (lastError instanceof HttpException) {
      throw lastError
    }
    throw TokenException.AccessTokenInvalid
  }

  private async handleAndCondition(guards: CanActivate[], context: ExecutionContext) {
    for (const guard of guards) {
      try {
        if (!(await guard.canActivate(context))) {
          throw TokenException.AccessTokenInvalid
        }
      } catch (error) {
        if (error instanceof HttpException) {
          throw error
        }
        throw TokenException.AccessTokenInvalid
      }
    }
    return true
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authMetadata = this.extractAuthMetadata(context)

    const authTypes = authMetadata?.authTypes ?? [AuthType.Bearer]
    const condition = authMetadata?.condition ?? AuthOptionsType.AND
    const guards = authTypes.map((type) => this.authTypeGuardMap[type])

    if (condition === 'or') {
      return this.handleOrCondition(guards, context)
    }
    return this.handleAndCondition(guards, context)
  }
}
