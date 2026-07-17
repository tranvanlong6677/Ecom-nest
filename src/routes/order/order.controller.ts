import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { OrderService } from './order.service'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { CreateOrderBodyDTO, CreateOrderResDTO, GetOrderListQueryDTO, GetOrderListResDTO } from './order.dto'

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ZodSerializerDto(GetOrderListResDTO)
  list(@ActiveUser('userId') userId: number, @Query() query: GetOrderListQueryDTO) {
    return this.orderService.list(userId, query)
  }

  @Post()
  @ZodSerializerDto(CreateOrderResDTO)
  create(@ActiveUser('userId') userId: number, @Body() data: CreateOrderBodyDTO) {
    return this.orderService.create({ userId, data })
  }
}
