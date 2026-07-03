import { Injectable } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { OAUTH_EXCHANGE_TTL_MS } from '@/routes/auth/oauth/oauth.constants'

interface OAuthTokens {
  accessToken: string
  refreshToken: string
}

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

/**
 * In-memory only — same single-instance assumption as OAuthStateService. Tokens are
 * never placed in the redirect URL directly; only this opaque, single-use code is,
 * so leaking it via browser history/Referer/logs has at most a 60s blast radius.
 */
@Injectable()
export class OAuthExchangeService {
  private readonly store = new Map<string, CacheEntry<OAuthTokens>>()

  save(tokens: OAuthTokens): string {
    const code = randomBytes(32).toString('hex')
    this.store.set(code, { value: tokens, expiresAt: Date.now() + OAUTH_EXCHANGE_TTL_MS })
    return code
  }

  consume(code: string): OAuthTokens | null {
    const entry = this.store.get(code)
    this.store.delete(code)
    if (!entry || entry.expiresAt < Date.now()) {
      return null
    }
    return entry.value
  }

  sweepExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.store) {
      if (entry.expiresAt < now) {
        this.store.delete(key)
      }
    }
  }
}
