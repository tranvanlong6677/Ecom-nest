import { BrandIncludeTranslationSchema } from '@/shared/models/brand.model'
import { CategoryIncludeTranslationSchema } from '@/shared/models/category.model'
import { OrderBy, SortBy } from '@/shared/constants/other.constants'
import { z } from 'zod'
import { ProductTranslationSchema } from '@/shared/models/product-translation.model'
import { SKUSchema, SKUType, UpsertSKUBodySchema } from '@/shared/models/sku.model'
import { ProductSchema, VariantsType } from '@/shared/models/product.model'

export const generateSKUs = (variants: VariantsType): Pick<SKUType, 'value' | 'price' | 'stock' | 'image'>[] => {
  const combinations = variants
    .map((variant) => variant.options)
    .reduce<string[]>(
      (acc, options) => acc.flatMap((prefix) => options.map((option) => `${prefix}${prefix ? '-' : ''}${option}`)),
      [''],
    )

  return combinations.map((value) => ({
    value,
    price: 0,
    stock: 100,
    image: '',
  }))
}

const arrayQueryParamSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim())
  }
  return value
}, z.array(z.coerce.number().int().positive()))

export const GetProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    name: z.string().optional(),
    brandIds: arrayQueryParamSchema.optional(),
    categories: arrayQueryParamSchema.optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Desc),
    sortBy: z.enum([SortBy.CreatedAt, SortBy.Price, SortBy.Sale]).default(SortBy.CreatedAt),
  })
  .strict()

export const GetManageProductsQuerySchema = GetProductsQuerySchema.extend({
  isPublic: z.preprocess((value) => value === 'true', z.boolean()).optional(),
  createdById: z.coerce.number().int().positive(),
})

export const GetProductsResSchema = z.object({
  data: z.array(
    ProductSchema.extend({
      productTranslations: z.array(ProductTranslationSchema),
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetProductParamsSchema = z
  .object({
    productId: z.coerce.number().int().positive(),
  })
  .strict()

export const GetProductDetailResSchema = ProductSchema.extend({
  productTranslations: z.array(ProductTranslationSchema),
  skus: z.array(SKUSchema),
  categories: z.array(CategoryIncludeTranslationSchema),
  brand: BrandIncludeTranslationSchema,
})

export const DeleteProductQuerySchema = z
  .object({
    hardDelete: z.coerce.boolean().optional().default(false),
  })
  .strict()

export const CreateProductBodySchema = ProductSchema.pick({
  name: true,
  basePrice: true,
  virtualPrice: true,
  brandId: true,
  images: true,
  variants: true,
})
  .extend({
    categories: z.array(z.number().int().positive()),
    skus: z.array(UpsertSKUBodySchema),
  })
  .strict()
  .superRefine(({ variants, skus }, ctx) => {
    const generatedSKUs = generateSKUs(variants)

    if (skus.length !== generatedSKUs.length) {
      ctx.addIssue({
        code: 'custom',
        message: `Số lượng SKU nhận vào (${skus.length}) không khớp với số lượng SKU cần tạo (${generatedSKUs.length}) dựa trên variants`,
        path: ['skus'],
      })
      return
    }

    skus.forEach((sku, index) => {
      if (sku.value !== generatedSKUs[index].value) {
        ctx.addIssue({
          code: 'custom',
          message: `Giá trị SKU tại vị trí ${index} phải là '${generatedSKUs[index].value}'`,
          path: ['skus', index, 'value'],
        })
      }
    })
  })

export const UpdateProductBodySchema = CreateProductBodySchema

export type GetProductsQueryType = z.infer<typeof GetProductsQuerySchema>
export type GetManageProductsQueryType = z.infer<typeof GetManageProductsQuerySchema>
export type GetProductsResType = z.infer<typeof GetProductsResSchema>
export type GetProductParamsType = z.infer<typeof GetProductParamsSchema>
export type GetProductDetailResType = z.infer<typeof GetProductDetailResSchema>
export type DeleteProductQueryType = z.infer<typeof DeleteProductQuerySchema>
export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema>
export type UpdateProductBodyType = z.infer<typeof UpdateProductBodySchema>
