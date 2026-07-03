/**
 * Thrown internally during the OAuth callback pipeline. OAuthService.handleCallback
 * catches this and maps `.code` onto the `?error=` query param of the redirect back
 * to the frontend, instead of letting a raw exception escape a browser redirect.
 */
export class OAuthFlowError extends Error {
  constructor(readonly code: string) {
    super(`OAuth flow failed: ${code}`)
  }
}
