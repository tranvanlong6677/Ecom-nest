import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AUTH_TYPE_KEY } from '../decorators/auth.decorator'
import { AuthType } from '../enums/auth-type.enum'
import { AccessTokenGuard } from './access-token.guard'
import { ApiKeyGuard } from './api-key.guard'

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<AuthType, CanActivate>

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.APIKey]: this.apiKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authMetadata = this.reflector.getAllAndOverride<{
      authTypes: AuthType[]
      condition: 'or' | 'and'
    }>(AUTH_TYPE_KEY, [context.getHandler(), context.getClass()])

    const authTypes = authMetadata?.authTypes ?? [AuthType.None]
    const condition = authMetadata?.condition ?? 'or'
    const guards = authTypes.map((type) => this.authTypeGuardMap[type])

    let error: unknown = new UnauthorizedException()

    if (condition === 'or') {
      for (const guard of guards) {
        const canActivate = await Promise.resolve(guard.canActivate(context)).catch((err) => {
          error = err
          return false
        })
        if (canActivate) return true
      }
      throw error
    }

    // AND: tất cả guard phải pass
    for (const guard of guards) {
      const canActivate = await Promise.resolve(guard.canActivate(context)).catch((err) => {
        error = err
        return false
      })
      if (!canActivate) throw error
    }
    return true
  }
}
