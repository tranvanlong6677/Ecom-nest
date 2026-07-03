import { Injectable } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { OAuthProvider } from '@/generated/prisma/client'
import { OAUTH_STATE_TTL_MS } from '@/routes/auth/oauth/oauth.constants'

interface OAuthStateValue {
  provider: OAuthProvider
  redirectUri: string
}

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

/**
 * In-memory only — assumes a single backend instance. If this ever runs behind a
 * load balancer without sticky sessions, move this store to Redis/DB, since a
 * callback landing on instance B won't see state saved on instance A.
 */
@Injectable()
export class OAuthStateService {
  private readonly store = new Map<string, CacheEntry<OAuthStateValue>>()

  generate(value: OAuthStateValue): string {
    const state = randomBytes(32).toString('hex')
    this.store.set(state, { value, expiresAt: Date.now() + OAUTH_STATE_TTL_MS })
    return state
  }

  consume(state: string): OAuthStateValue | null {
    const entry = this.store.get(state)
    this.store.delete(state)
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
