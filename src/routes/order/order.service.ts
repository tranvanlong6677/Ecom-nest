import { Injectable } from '@nestjs/common'
import { OrderRepo } from './order.repo'
import { CreateOrderBodyType, GetOrderListQueryType } from './order.model'

@Injectable()
export class OrderService {
  constructor(private readonly orderRepo: OrderRepo) {}

  list(userId: number, query: GetOrderListQueryType) {
    return this.orderRepo.list(userId, query)
  }

  create({ userId, data }: { userId: number; data: CreateOrderBodyType }) {
    return this.orderRepo.createOrder({ userId, data })
  }
}
