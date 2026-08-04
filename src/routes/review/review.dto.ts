import { createZodDto } from 'nestjs-zod'
import {
  CreateReviewBodySchema,
  CreateReviewResSchema,
  GetReviewsParamsSchema,
  GetReviewsResSchema,
  ReviewParamsSchema,
  UpdateReviewBodySchema,
  UpdateReviewResSchema,
} from './review.model'

export class GetReviewsParamsDTO extends createZodDto(GetReviewsParamsSchema) {}

export class GetReviewsResDTO extends createZodDto(GetReviewsResSchema) {}

export class CreateReviewBodyDTO extends createZodDto(CreateReviewBodySchema) {}

export class CreateReviewResDTO extends createZodDto(CreateReviewResSchema) {}

export class ReviewParamsDTO extends createZodDto(ReviewParamsSchema) {}

export class UpdateReviewBodyDTO extends createZodDto(UpdateReviewBodySchema) {}

export class UpdateReviewResDTO extends createZodDto(UpdateReviewResSchema) {}
