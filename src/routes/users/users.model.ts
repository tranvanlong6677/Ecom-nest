import { UserStatus } from '@/shared/constants/auth.constants'
import { UserSchema } from '@/shared/models/user.model'
import { z } from 'zod'

export const CreateUserBodySchema = UserSchema.pick({
  email: true,
  name: true,
  phoneNumber: true,
  avatar: true,
  roleId: true,
  password: true,
  status: true,
}).extend({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  status: z.enum(UserStatus).optional().default(UserStatus.ACTIVE),
})

export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>

export const CreateUserResSchema = UserSchema.pick({
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  roleId: true,
  status: true,
})

export type CreateUserResType = z.infer<typeof CreateUserResSchema>

export const UpdateUserBodySchema = CreateUserBodySchema.partial().extend({
  roleId: z.number(),
})

export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>

export const UpdateUserResSchema = CreateUserResSchema

export type UpdateUserResType = CreateUserResType

export const GetUsersResSchema = z.object({
  data: z.array(
    UserSchema.omit({ password: true, totpSecret: true }).extend({
      role: z.object({ id: z.number(), name: z.string() }),
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export type GetUsersResType = z.infer<typeof GetUsersResSchema>

export const GetUserDetailResSchema = UserSchema.omit({ password: true, totpSecret: true })

export type GetUserDetailResType = z.infer<typeof GetUserDetailResSchema>
