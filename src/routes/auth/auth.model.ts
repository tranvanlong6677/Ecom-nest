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

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>

export const LoginBodySchema = z.object({
  email: z.email(),
  password: z.string(),
})

export type LoginBodyType = z.infer<typeof LoginBodySchema>

export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

export type RegisterResType = z.infer<typeof RegisterResSchema>

export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.email(),
  code: z.string().max(6).min(6),
  type: z.enum(VerificationCodePurpose),
  expiresAt: z.date(),
  createdAt: z.date().optional(),
})

export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>

export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict()

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>
