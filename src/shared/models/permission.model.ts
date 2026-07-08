import { HTTPMethod } from '@/shared/constants/role.constant'
import { z } from 'zod'

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required').max(500, 'Name must be at most 500 characters long'),
  description: z.string(),
  path: z.string().min(1, 'Path is required').max(1000, 'Path must be at most 1000 characters long'),
  method: z.enum(HTTPMethod),
  module: z.string(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type PermissionType = z.infer<typeof PermissionSchema>
