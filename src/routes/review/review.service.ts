import { Injectable } from '@nestjs/common'
import { PaginationParamsType } from '@/shared/models/request.model'
import { ReviewRepo } from './review.repo'
import { CreateReviewBodyType, UpdateReviewBodyType } from './review.model'

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepo: ReviewRepo) {}

  list(productId: number, pagination: PaginationParamsType) {
    return this.reviewRepo.list(productId, pagination)
  }

  create(userId: number, body: CreateReviewBodyType) {
    return this.reviewRepo.create(userId, body)
  }

  update(userId: number, reviewId: number, body: UpdateReviewBodyType) {
    return this.reviewRepo.update({ userId, reviewId, body })
  }
}
