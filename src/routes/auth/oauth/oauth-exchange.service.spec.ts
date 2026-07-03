import { OAuthExchangeService } from './oauth-exchange.service'

describe('OAuthExchangeService', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns the stored tokens on the first consume', () => {
    const service = new OAuthExchangeService()
    const tokens = { accessToken: 'a', refreshToken: 'r' }
    const code = service.save(tokens)

    expect(service.consume(code)).toEqual(tokens)
  })

  it('is single-use: a second consume of the same code returns null', () => {
    const service = new OAuthExchangeService()
    const code = service.save({ accessToken: 'a', refreshToken: 'r' })

    service.consume(code)

    expect(service.consume(code)).toBeNull()
  })

  it('returns null once the TTL has elapsed, even without a prior consume', () => {
    const service = new OAuthExchangeService()
    const code = service.save({ accessToken: 'a', refreshToken: 'r' })

    jest.advanceTimersByTime(60 * 1000 + 1)

    expect(service.consume(code)).toBeNull()
  })

  it('returns null for an unknown code', () => {
    const service = new OAuthExchangeService()
    expect(service.consume('never-issued')).toBeNull()
  })
})
