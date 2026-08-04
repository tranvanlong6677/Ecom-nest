import { MediaType } from '@/shared/constants/media.constant'
import { UserSchema } from '@/shared/models/user.model'
import { z } from 'zod'

export const ReviewMediaSchema = z.object({
  id: z.number(),
  url: z.string(),
  type: z.enum(MediaType),
  reviewId: z.number(),
  createdAt: z.date(),
})

export const ReviewSchema = z.object({
  id: z.number(),
  content: z.string(),
  rating: z.number(),
  orderId: z.number(),
  productId: z.number(),
  userId: z.number(),
  updateCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const ReviewDetailSchema = ReviewSchema.extend({
  user: UserSchema.pick({ id: true, name: true, avatar: true }),
  medias: z.array(ReviewMediaSchema),
})

export const GetReviewsParamsSchema = z
  .object({
    productId: z.coerce.number().int().positive(),
  })
  .strict()

export const GetReviewsResSchema = z.object({
  data: z.array(ReviewDetailSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const ReviewMediaBodySchema = ReviewMediaSchema.pick({
  url: true,
  type: true,
})

export const CreateReviewBodySchema = z
  .object({
    content: z.string().min(1).max(1000),
    rating: z.number().int().min(0).max(5),
    productId: z.number().int().positive(),
    orderId: z.number().int().positive(),
    medias: z.array(ReviewMediaBodySchema),
  })
  .strict()

export const CreateReviewResSchema = ReviewDetailSchema

export const ReviewParamsSchema = z
  .object({
    reviewId: z.coerce.number().int().positive(),
  })
  .strict()

export const UpdateReviewBodySchema = CreateReviewBodySchema.pick({
  content: true,
  rating: true,
  medias: true,
}).strict()

export const UpdateReviewResSchema = ReviewDetailSchema

export type ReviewType = z.infer<typeof ReviewSchema>
export type ReviewDetailType = z.infer<typeof ReviewDetailSchema>
export type GetReviewsParamsType = z.infer<typeof GetReviewsParamsSchema>
export type GetReviewsResType = z.infer<typeof GetReviewsResSchema>
export type CreateReviewBodyType = z.infer<typeof CreateReviewBodySchema>
export type ReviewParamsType = z.infer<typeof ReviewParamsSchema>
export type UpdateReviewBodyType = z.infer<typeof UpdateReviewBodySchema>
