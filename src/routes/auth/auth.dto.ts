import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { UserStatus } from '../../generated/prisma/enums'

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
  phoneNumber: z.string(),
  roleId: z.number(),
  avatar: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.INACTIVE]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
})

export class RegisterResDTO extends createZodDto(UserSchema) {}

const RegisterSchema = z
  .object({
    name: z.string(),
    email: z.email(),
    phoneNumber: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })

export class RegisterBodyDto extends createZodDto(RegisterSchema) {}

const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
})

export class LoginDto extends createZodDto(LoginSchema) {}
