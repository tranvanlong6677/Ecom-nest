import { HTTPMethod } from '@/shared/constants/role.constant'
import { PermissionSchema } from '@/shared/models/permission.model'
import { z } from 'zod'

export const GetPermissionsResSchema = z.object({
  data: z.record(z.string(), z.array(PermissionSchema)),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetPermissionsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict()

export const DeletePermissionQuerySchema = z
  .object({
    hardDelete: z.coerce.boolean().optional().default(false),
  })
  .strict()

export const GetPermissionParamsSchema = z
  .object({
    permissionId: z.coerce.number().int().positive(),
  })
  .strict()

export const CreatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  description: true,
  path: true,
  method: true,
  module: true,
}).strict()

export const UpdatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  description: true,
  path: true,
  method: true,
  module: true,
}).strict()

export type GetPermissionsResType = z.infer<typeof GetPermissionsResSchema>
export type GetPermissionsQueryType = z.infer<typeof GetPermissionsQuerySchema>
export type DeletePermissionQueryType = z.infer<typeof DeletePermissionQuerySchema>
export type GetPermissionParamsType = z.infer<typeof GetPermissionParamsSchema>
export type CreatePermissionBodyType = z.infer<typeof CreatePermissionBodySchema>
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionBodySchema>
