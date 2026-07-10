import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { z } from 'zod'

dotenv.config({ path: '.env' })

if (!fs.existsSync(path.resolve('.env'))) {
  console.log('Không tìm thấy file .env')
  process.exit(1)
}

const configSchema = z
  .object({
    DATABASE_URL: z.string(),
    ACCESS_TOKEN_SECRET: z.string(),
    ACCESS_TOKEN_EXPIRES_IN: z.string(),
    REFRESH_TOKEN_SECRET: z.string(),
    REFRESH_TOKEN_EXPIRES_IN: z.string(),
    SECRET_API_KEY: z.string(),
    PORT: z.string().optional().default('8000'),
    APP_NAME: z.string(),
    APP_URL: z.string(),
    ADMIN_NAME: z.string(),
    ADMIN_PASSWORD: z.string(),
    ADMIN_EMAIL: z.string(),
    ADMIN_PHONE_NUMBER: z.string(),
    OTP_EXPIRES: z.string(),
    RESEND_API_KEY: z.string(),
    RESEND_FROM_EMAIL: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_REDIRECT_URI: z.string(),
    FACEBOOK_CLIENT_ID: z.string(),
    FACEBOOK_CLIENT_SECRET: z.string(),
    FACEBOOK_REDIRECT_URI: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    GITHUB_REDIRECT_URI: z.string(),
    OAUTH_ALLOWED_REDIRECT_URIS: z.string(),
    OAUTH_DEFAULT_REDIRECT_URI: z.string(),
  })
  .superRefine((data, ctx) => {
    const allowedRedirectUris = data.OAUTH_ALLOWED_REDIRECT_URIS.split(',').map((uri) => uri.trim())
    if (!allowedRedirectUris.includes(data.OAUTH_DEFAULT_REDIRECT_URI)) {
      ctx.addIssue({
        code: 'custom',
        message: 'OAUTH_DEFAULT_REDIRECT_URI must be included in OAUTH_ALLOWED_REDIRECT_URIS',
        path: ['OAUTH_DEFAULT_REDIRECT_URI'],
      })
    }
  })

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  console.log('Các giá trị trong .env không hợp lệ', configServer.error.issues)
  process.exit(1)
}

const envConfig = configServer.data

export default envConfig
