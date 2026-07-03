import { OAuthProvider } from '@/generated/prisma/client'
import { OAuthStateService } from './oauth-state.service'

describe('OAuthStateService', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns the stored value on the first consume', () => {
    const service = new OAuthStateService()
    const value = { provider: OAuthProvider.GOOGLE, redirectUri: 'https://app.example.com/callback' }
    const state = service.generate(value)

    expect(service.consume(state)).toEqual(value)
  })

  it('is single-use: a second consume of the same state returns null', () => {
    const service = new OAuthStateService()
    const state = service.generate({ provider: OAuthProvider.GOOGLE, redirectUri: 'https://app.example.com/callback' })

    service.consume(state)

    expect(service.consume(state)).toBeNull()
  })

  it('returns null once the TTL has elapsed, even without a prior consume', () => {
    const service = new OAuthStateService()
    const state = service.generate({ provider: OAuthProvider.GOOGLE, redirectUri: 'https://app.example.com/callback' })

    jest.advanceTimersByTime(5 * 60 * 1000 + 1)

    expect(service.consume(state)).toBeNull()
  })

  it('returns null for an unknown state', () => {
    const service = new OAuthStateService()
    expect(service.consume('never-issued')).toBeNull()
  })
})
