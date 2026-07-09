import { Prisma } from '@/generated/prisma/client'
import { z } from 'zod'

export const EmptyBodySchema = z.object({}).strict()

export type EmptyBodyType = z.infer<typeof EmptyBodySchema>

export const QueryParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sort: z.enum([Prisma.SortOrder.asc, Prisma.SortOrder.desc]).optional().default(Prisma.SortOrder.desc),
})

export type QueryParamsType = z.infer<typeof QueryParamsSchema>
