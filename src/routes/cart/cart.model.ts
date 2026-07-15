import z from 'zod'
import { ProductSchema } from '@/shared/models/product.model'
import { ProductTranslationSchema } from '../product/product-translation/product-translation.model'
import { SKUSchema } from '@/shared/models/sku.model'
import { UserSchema } from '@/shared/models/user.model'

export const CartItemSchema = z.object({
  id: z.number(),
  quantity: z.number().int().positive(),
  skuId: z.number(),
  userId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const GetCartItemParamsSchema = z.object({
  cartItemId: z.coerce.number().int().positive(),
})

export const CartItemDetailSchema = z.object({
  shop: UserSchema.pick({ id: true, name: true, avatar: true }),
  cartItems: z.array(
    CartItemSchema.extend({
      sku: SKUSchema.extend({
        product: ProductSchema.extend({
          productTranslations: z.array(
            ProductTranslationSchema.omit({
              createdById: true,
              updatedById: true,
              deletedById: true,
              deletedAt: true,
              createdAt: true,
              updatedAt: true,
            }),
          ),
        }).omit({
          createdById: true,
          updatedById: true,
          deletedById: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true,
        }),
      }).omit({
        createdById: true,
        updatedById: true,
        deletedById: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      }),
    }),
  ),
})

export const GetCartResSchema = z.object({
  data: z.array(CartItemDetailSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const AddCartBodySchema = CartItemSchema.pick({
  quantity: true,
  skuId: true,
}).strict()

export const UpdateCartBodySchema = AddCartBodySchema

export const UpdateCartResSchema = CartItemDetailSchema

export const DeleteCartBodySchema = z
  .object({
    cartItemIds: z.array(z.coerce.number().int().positive()),
  })
  .strict()

export const AddCartResSchema = CartItemDetailSchema

export type GetCartItemParamsType = z.infer<typeof GetCartItemParamsSchema>
export type AddCartBodyType = z.infer<typeof AddCartBodySchema>
export type UpdateCartBodyType = z.infer<typeof UpdateCartBodySchema>
export type UpdateCartResType = z.infer<typeof UpdateCartResSchema>
export type DeleteCartBodyType = z.infer<typeof DeleteCartBodySchema>
export type CartItemType = z.infer<typeof CartItemSchema>
export type CartItemDetailType = z.infer<typeof CartItemDetailSchema>
export type GetCartResType = z.infer<typeof GetCartResSchema>
