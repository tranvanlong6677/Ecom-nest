import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'

export const ReviewException = {
  OrderNotFound: new NotFoundException([
    {
      path: 'orderId',
      code: 'ERROR.REVIEW_ORDER_NOT_FOUND',
      message: 'Order does not exist or does not belong to you',
    },
  ]),
  OrderNotDelivered: new BadRequestException([
    { path: 'orderId', code: 'ERROR.REVIEW_ORDER_NOT_DELIVERED', message: 'Order has not been delivered yet' },
  ]),
  NotFound: new NotFoundException([
    { path: 'reviewId', code: 'ERROR.REVIEW_NOT_FOUND', message: 'Review does not exist or does not belong to you' },
  ]),
  UpdateLimitExceeded: new BadRequestException([
    { path: 'reviewId', code: 'ERROR.REVIEW_UPDATE_LIMIT_EXCEEDED', message: 'You can only edit a review once' },
  ]),
  AlreadyReviewed: new ConflictException([
    {
      path: 'productId',
      code: 'ERROR.REVIEW_ALREADY_EXISTS',
      message: 'You have already reviewed this product for this order',
    },
  ]),
}
