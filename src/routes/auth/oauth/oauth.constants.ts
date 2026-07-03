import { OAuthProvider } from '@/generated/prisma/client'

export const OAUTH_PROVIDER_PARAM_MAP: Record<'google' | 'facebook' | 'github', OAuthProvider> = {
  google: OAuthProvider.GOOGLE,
  facebook: OAuthProvider.FACEBOOK,
  github: OAuthProvider.GITHUB,
}

export const GOOGLE_OAUTH_ENDPOINTS = {
  AUTHORIZE_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN_URL: 'https://oauth2.googleapis.com/token',
  USERINFO_URL: 'https://www.googleapis.com/oauth2/v3/userinfo',
  SCOPE: 'openid email profile',
}

export const FACEBOOK_OAUTH_ENDPOINTS = {
  AUTHORIZE_URL: 'https://www.facebook.com/v19.0/dialog/oauth',
  TOKEN_URL: 'https://graph.facebook.com/v19.0/oauth/access_token',
  USERINFO_URL: 'https://graph.facebook.com/me',
  SCOPE: 'email,public_profile',
}

export const GITHUB_OAUTH_ENDPOINTS = {
  AUTHORIZE_URL: 'https://github.com/login/oauth/authorize',
  TOKEN_URL: 'https://github.com/login/oauth/access_token',
  USERINFO_URL: 'https://api.github.com/user',
  EMAILS_URL: 'https://api.github.com/user/emails',
  SCOPE: 'read:user user:email',
  USER_AGENT: 'ecom-nest-oauth',
}

export const OAUTH_STATE_TTL_MS = 5 * 60 * 1000

export const OAUTH_EXCHANGE_TTL_MS = 60 * 1000
