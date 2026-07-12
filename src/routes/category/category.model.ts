import { CategorySchema } from '@/shared/models/category.model'
import { CategoryTranslationSchema } from '@/shared/models/category-translation.model'
import { z } from 'zod'

export const CategoryWithTranslationsSchema = CategorySchema.extend({
  categoryTranslations: z.array(CategoryTranslationSchema),
})

export type CategoryWithTranslationsType = z.infer<typeof CategoryWithTranslationsSchema>

export const GetCategoriesResSchema = z.object({
  data: z.array(CategoryWithTranslationsSchema),
  totalItems: z.number(),
})

export type CategoryTreeNodeType = CategoryWithTranslationsType & {
  childrenCategories: CategoryTreeNodeType[]
}

export const CategoryTreeNodeSchema: z.ZodType<CategoryTreeNodeType> = CategoryWithTranslationsSchema.extend({
  childrenCategories: z.lazy(() => z.array(CategoryTreeNodeSchema)),
})

export const GetCategoryTreeResSchema = z.object({
  data: z.array(CategoryTreeNodeSchema),
})

export const GetCategoriesQuerySchema = z
  .object({
    parentCategoryId: z.coerce.number().int().positive().optional(),
  })
  .strict()

export const GetCategoryParamsSchema = z
  .object({
    categoryId: z.coerce.number().int().positive(),
  })
  .strict()

export const DeleteCategoryQuerySchema = z
  .object({
    hardDelete: z.coerce.boolean().optional().default(false),
  })
  .strict()

export const CreateCategoryBodySchema = CategorySchema.pick({
  name: true,
  logo: true,
  parentCategoryId: true,
}).strict()

export const UpdateCategoryBodySchema = CategorySchema.pick({
  name: true,
  logo: true,
  parentCategoryId: true,
}).strict()

export type GetCategoryTreeResType = z.infer<typeof GetCategoryTreeResSchema>
export type GetCategoriesResType = z.infer<typeof GetCategoriesResSchema>
export type GetCategoriesQueryType = z.infer<typeof GetCategoriesQuerySchema>
export type GetCategoryParamsType = z.infer<typeof GetCategoryParamsSchema>
export type DeleteCategoryQueryType = z.infer<typeof DeleteCategoryQuerySchema>
export type CreateCategoryBodyType = z.infer<typeof CreateCategoryBodySchema>
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>
