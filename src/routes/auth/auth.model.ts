import { VerificationCodePurpose } from '@/shared/constants/auth.constants'
import { UserSchema } from '@/shared/models/user.model'
import { z } from 'zod'

export const RegisterBodySchema = UserSchema.pick({
  name: true,
  email: true,
})
  .extend({
    phoneNumber: UserSchema.shape.phoneNumber.unwrap(),
    password: UserSchema.shape.password.unwrap(),
    confirmPassword: z.string().min(1).max(100),
    code: z.string().min(6).max(6),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })

export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.email(),
  code: z.string().max(6).min(6),
  type: z.enum(VerificationCodePurpose),
  expiresAt: z.date(),
  createdAt: z.date().optional(),
})

export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict()

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
})

  .extend({
    totpCode: z.string().length(6).optional(), //2FA code
    code: z.string().length(6).optional(), //Email otp code
  })
  .strict()
  .superRefine(({ totpCode, code }, ctx) => {
    if (totpCode !== undefined && code !== undefined) {
      const message = 'Bạn chỉ được cung cấp mã xác thực 2FA hoặc mã OTP, không được cung cấp cả 2'
      ctx.addIssue({ path: ['totpCode'], message, code: 'custom' })
      ctx.addIssue({ path: ['code'], message, code: 'custom' })
    }
  })

export const LoginResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict()

export const RefreshTokenResSchema = LoginResSchema

export const LogoutBodySchema = RefreshTokenBodySchema

export const ForgotPasswordBodySchema = z
  .object({
    email: z.email(),
    code: z.string().length(6),
    newPassword: z.string().min(6).max(100),
    confirmNewPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ confirmNewPassword, newPassword }, ctx) => {
    if (confirmNewPassword !== newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Mật khẩu và mật khẩu xác nhận phải giống nhau',
        path: ['confirmNewPassword'],
      })
    }
  })

export const DeviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  isActive: z.boolean(),
  createdAt: z.date().optional(),
  lastActive: z.date(),
})

export const RefreshTokenSchema = z.object({
  // id: z.number(),
  userId: z.number(),
  token: z.string(),
  deviceId: z.number(),
  expiresAt: z.date(),
  createdAt: z.date().optional(),
})

export const DisableTwoFactorBodySchema = z
  .object({
    totpCode: z.string().length(6).optional(),
    code: z.string().length(6).optional(),
  })
  .strict()
  .superRefine(({ totpCode, code }, ctx) => {
    const message = 'Bạn phải cung cấp mã xác thực 2FA hoặc mã OTP. Không được cung cấp cả 2'
    // Nếu cả 2 đều có hoặc không có thì sẽ nhảy vào if
    if ((totpCode !== undefined) === (code !== undefined)) {
      ctx.addIssue({
        path: ['totpCode'],
        message,
        code: 'custom',
      })
      ctx.addIssue({
        path: ['code'],
        message,
        code: 'custom',
      })
    }
  })
export const TwoFactorSetupResSchema = z.object({
  secret: z.string(),
  uri: z.string(),
})

export type DisableTwoFactorBodyType = z.infer<typeof DisableTwoFactorBodySchema>

export type TwoFactorSetupResType = z.infer<typeof TwoFactorSetupResSchema>

export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>

export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>

export type DeviceType = z.infer<typeof DeviceSchema>

export type RefreshTokenResType = z.infer<typeof RefreshTokenResSchema>

export type LogoutBodyType = RefreshTokenBodyType

export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>

export type LoginResType = z.infer<typeof LoginResSchema>

export type LoginBodyType = z.infer<typeof LoginBodySchema>

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>

export type VerificationCodePurposeType = (typeof VerificationCodePurpose)[keyof typeof VerificationCodePurpose]

export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>

export type RegisterResType = z.infer<typeof RegisterResSchema>
