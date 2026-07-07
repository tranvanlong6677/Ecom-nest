import { PermissionSchema } from '@/routes/permission/permission.model'
import { z } from 'zod'

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required').max(500, 'Name must be at most 500 characters long'),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type RoleType = z.infer<typeof RoleSchema>

export const RoleWithPermissionsSchema = RoleSchema.extend({
  permissions: z.array(
    PermissionSchema.pick({
      id: true,
      name: true,
      description: true,
      path: true,
      method: true,
    }),
  ),
})

export type RoleWithPermissionsType = z.infer<typeof RoleWithPermissionsSchema>

export const GetRolesResSchema = z.object({
  data: z.array(RoleSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetRolesQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict()

export const GetRoleParamsSchema = z
  .object({
    roleId: z.coerce.number().int().positive(),
  })
  .strict()

export const DeleteRoleQuerySchema = z
  .object({
    hardDelete: z.coerce.boolean().optional().default(false),
  })
  .strict()

export const CreateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
})
  .extend({
    isActive: RoleSchema.shape.isActive.optional().default(true),
  })
  .strict()

export const UpdateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
})
  .extend({
    permissionIds: z.array(z.number().int().positive()),
  })
  .strict()

export type GetRolesResType = z.infer<typeof GetRolesResSchema>
export type GetRolesQueryType = z.infer<typeof GetRolesQuerySchema>
export type GetRoleParamsType = z.infer<typeof GetRoleParamsSchema>
export type DeleteRoleQueryType = z.infer<typeof DeleteRoleQuerySchema>
export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>
