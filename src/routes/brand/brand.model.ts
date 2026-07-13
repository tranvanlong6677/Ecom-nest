import { BrandSchema } from '@/shared/models/brand.model'
import { z } from 'zod'

export const GetBrandsResSchema = z.object({
  data: z.array(BrandSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetBrandsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict()

export const GetBrandParamsSchema = z
  .object({
    brandId: z.coerce.number().int().positive(),
  })
  .strict()

export const DeleteBrandQuerySchema = z
  .object({
    hardDelete: z.coerce.boolean().optional().default(false),
  })
  .strict()

export const CreateBrandBodySchema = BrandSchema.pick({
  logo: true,
  name: true,
}).strict()

export const UpdateBrandBodySchema = BrandSchema.pick({
  logo: true,
  name: true,
}).strict()

export type GetBrandsResType = z.infer<typeof GetBrandsResSchema>
export type GetBrandsQueryType = z.infer<typeof GetBrandsQuerySchema>
export type GetBrandParamsType = z.infer<typeof GetBrandParamsSchema>
export type DeleteBrandQueryType = z.infer<typeof DeleteBrandQuerySchema>
export type CreateBrandBodyType = z.infer<typeof CreateBrandBodySchema>
export type UpdateBrandBodyType = z.infer<typeof UpdateBrandBodySchema>
