import z from 'zod'

export const VariantSchema = z.object({
  value: z.string().trim().min(1, 'Variant value is required'),
  options: z.array(z.string().trim().min(1, 'Variant option is required')),
})

export type VariantType = z.infer<typeof VariantSchema>

export const VariantsSchema = z.array(VariantSchema).superRefine((variants, ctx) => {
  variants.forEach((variant, index) => {
    const isValueDuplicate = variants.some(
      (other, otherIndex) => otherIndex !== index && other.value.toLowerCase() === variant.value.toLowerCase(),
    )
    if (isValueDuplicate) {
      ctx.addIssue({
        code: 'custom',
        message: `Giá trị '${variant.value}' của variant không được trùng nhau`,
        path: [index, 'value'],
      })
    }

    const isOptionDuplicate = variant.options.some(
      (option, optionIndex) =>
        variant.options.findIndex((other) => other.toLowerCase() === option.toLowerCase()) !== optionIndex,
    )
    if (isOptionDuplicate) {
      ctx.addIssue({
        code: 'custom',
        message: `Các option của variant '${variant.value}' không được trùng nhau`,
        path: [index, 'options'],
      })
    }
  })
})


export const ProductSchema = z.object({
  id: z.number(),
  publishedAt: z.date().nullable(),
  name: z.string().trim().min(1, 'Name is required').max(500, 'Name must be at most 500 characters long'),
  basePrice: z.number().min(0, 'Base price must be zero or a positive number'),
  virtualPrice: z.number().min(0, 'Virtual price must be zero or a positive number'),
  brandId: z.number(),
  images: z.array(z.string()),
  variants: VariantsSchema,
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type ProductType = z.infer<typeof ProductSchema>
export type VariantsType = z.infer<typeof VariantsSchema>

