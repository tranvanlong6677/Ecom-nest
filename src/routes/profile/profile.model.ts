import { PermissionSchema } from '@/shared/models/permission.model'
import { RoleSchema } from '@/shared/models/role.model'
import { UserSchema } from '@/shared/models/user.model'
import { z } from 'zod'

export const UpdateProfileBodySchema = UserSchema.partial()
  .pick({
    name: true,
    phoneNumber: true,
    avatar: true,
  })
  .strict()

export type UpdateProfileBodyType = z.infer<typeof UpdateProfileBodySchema>

export const ChangePasswordBodySchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .refine(({ confirmPassword, newPassword }) => confirmPassword === newPassword, {
    message: 'Mật khẩu xác nhận và mật khẩu mới không khớp',
    path: ['confirmPassword'],
  })
  .refine(({ currentPassword, newPassword }) => currentPassword !== newPassword, {
    message: 'Mật khẩu mới và mật khẩu cũ không được giống nhau',
    path: ['newPassword'],
  })

export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>

export const ProfileResSchema = UserSchema.pick({
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true,
    description: true,
  }).extend({
    permissions: PermissionSchema.pick({
      id: true,
      name: true,
      description: true,
      path: true,
      method: true,
    }).array(),
  }),
})

export type ProfileResType = z.infer<typeof ProfileResSchema>

export const UpdateProfileResSchema = UserSchema.pick({
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  avatar: true,
})

export type UpdateProfileResType = z.infer<typeof UpdateProfileResSchema>
