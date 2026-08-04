import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { OrderStatus, Prisma } from '@/generated/prisma/client'
import { isUniqueConstraintPrismaError } from '@/shared/helper'
import { PaginationParamsType } from '@/shared/models/request.model'
import { CreateReviewBodyType, GetReviewsResType, ReviewDetailType, UpdateReviewBodyType } from './review.model'
import { ReviewException } from './review.error'

const reviewDetailInclude = {
  user: { select: { id: true, name: true, avatar: true } },
  medias: true,
} satisfies Prisma.ReviewInclude

@Injectable()
export class ReviewRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async list(productId: number, pagination: PaginationParamsType): Promise<GetReviewsResType> {
    const { page, limit, sort } = pagination
    const skip = (page - 1) * limit
    const take = limit
    const where: Prisma.ReviewWhereInput = { productId }

    const [totalItems, data] = await Promise.all([
      this.prismaService.review.count({ where }),
      this.prismaService.review.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: sort ?? 'desc' },
        include: reviewDetailInclude,
      }),
    ])

    return {
      data,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  private async validateOrder({ orderId, userId }: { orderId: number; userId: number }) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId, userId },
    })
    if (!order) {
      throw ReviewException.OrderNotFound
    }
    if (order.status !== OrderStatus.DELIVERED) {
      throw ReviewException.OrderNotDelivered
    }
    return order
  }

  private async validateUpdateReview({ reviewId, userId }: { reviewId: number; userId: number }) {
    const review = await this.prismaService.review.findUnique({
      where: { id: reviewId, userId },
    })
    if (!review) {
      throw ReviewException.NotFound
    }
    if (review.updateCount >= 1) {
      throw ReviewException.UpdateLimitExceeded
    }
    return review
  }

  async create(userId: number, body: CreateReviewBodyType): Promise<ReviewDetailType> {
    await this.validateOrder({ orderId: body.orderId, userId })

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const review = await tx.review.create({
          data: {
            content: body.content,
            rating: body.rating,
            orderId: body.orderId,
            productId: body.productId,
            userId,
          },
        })
        if (body.medias.length > 0) {
          await tx.reviewMedia.createMany({
            data: body.medias.map((media) => ({ ...media, reviewId: review.id })),
          })
        }
        return tx.review.findUniqueOrThrow({
          where: { id: review.id },
          include: reviewDetailInclude,
        })
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw ReviewException.AlreadyReviewed
      }
      throw error
    }
  }

  async update({
    userId,
    reviewId,
    body,
  }: {
    userId: number
    reviewId: number
    body: UpdateReviewBodyType
  }): Promise<ReviewDetailType> {
    const review = await this.validateUpdateReview({ reviewId, userId })
    await this.validateOrder({ orderId: review.orderId, userId })

    return this.prismaService.$transaction(async (tx) => {
      await tx.review.update({
        where: { id: reviewId },
        data: {
          content: body.content,
          rating: body.rating,
          updateCount: { increment: 1 },
        },
      })
      await tx.reviewMedia.deleteMany({ where: { reviewId } })
      if (body.medias.length > 0) {
        await tx.reviewMedia.createMany({
          data: body.medias.map((media) => ({ ...media, reviewId })),
        })
      }
      return tx.review.findUniqueOrThrow({
        where: { id: reviewId },
        include: reviewDetailInclude,
      })
    })
  }
}
