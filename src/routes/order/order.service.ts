import { Injectable } from '@nestjs/common'
import { OrderRepo } from './order.repo'
import { CreateOrderBodyType, GetOrderListQueryType } from '../../shared/models/order.model'
import { OrderProducer } from './order.producer'

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepo,
    private readonly orderProducer: OrderProducer,
  ) {}

  list(userId: number, query: GetOrderListQueryType) {
    return this.orderRepo.list(userId, query)
  }

  async create({ userId, data }: { userId: number; data: CreateOrderBodyType }) {
    const result = await this.orderRepo.createOrder({ userId, data })

    return result
  }

  detail(userId: number, orderId: number) {
    return this.orderRepo.detail(userId, orderId)
  }

  cancel(userId: number, orderId: number) {
    return this.orderRepo.cancel(userId, orderId)
  }
}
