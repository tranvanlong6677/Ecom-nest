import { VerificationCodePurpose } from '@/shared/constants/auth.constants'
import { UserSchema } from '@/shared/models/user.model'
import { z } from 'zod'

export const RegisterBodySchema = UserSchema.pick({
  name: true,
  email: true,
  phoneNumber: true,
  password: true,
})
  .extend({
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
}).strict()

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
