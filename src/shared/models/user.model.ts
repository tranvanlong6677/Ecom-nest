import { z } from 'zod'
import { UserStatus } from '../constants/auth.constants'
import { RoleType } from './role.model'

export const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required').max(255, 'Name must be at most 255 characters long'),
  email: z.email().min(1, 'Email is required').max(255, 'Email must be at most 255 characters long'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits long')
    .max(15, 'Phone number must be at most 15 digits long'),
  roleId: z.number().positive('Role ID must be a positive number'),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password must be at most 100 characters long'),
  status: z.enum(UserStatus),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
})

export type UserType = z.infer<typeof UserSchema>

export type UserWithRoleType = UserType & { role: RoleType }
