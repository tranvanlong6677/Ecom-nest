import { z } from 'zod'

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
  createdById: z.number().nullable().optional(),
  updatedById: z.number().nullable().optional(),
})

export type RoleType = z.infer<typeof RoleSchema>
