import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { ReviewService } from './review.service'
import {
  CreateReviewBodyDTO,
  CreateReviewResDTO,
  GetReviewsParamsDTO,
  GetReviewsResDTO,
  ReviewParamsDTO,
  UpdateReviewBodyDTO,
  UpdateReviewResDTO,
} from './review.dto'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { PaginationParamsDto } from '@/shared/dtos/request.dto'

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @IsPublic()
  @Get('products/:productId')
  @ZodSerializerDto(GetReviewsResDTO)
  list(@Param() params: GetReviewsParamsDTO, @Query() pagination: PaginationParamsDto) {
    return this.reviewService.list(params.productId, pagination)
  }

  @Post()
  @ApiBearerAuth('access-token')
  @ZodSerializerDto(CreateReviewResDTO)
  create(@Body() body: CreateReviewBodyDTO, @ActiveUser('userId') userId: number) {
    return this.reviewService.create(userId, body)
  }

  @Put(':reviewId')
  @ApiBearerAuth('access-token')
  @ZodSerializerDto(UpdateReviewResDTO)
  update(@Param() params: ReviewParamsDTO, @Body() body: UpdateReviewBodyDTO, @ActiveUser('userId') userId: number) {
    return this.reviewService.update(userId, params.reviewId, body)
  }
}
