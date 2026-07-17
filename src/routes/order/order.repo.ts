import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/services/prisma.service'
import { Prisma } from '@/generated/prisma/client'
import { GetOrderListQueryType, GetOrderListResType } from './order.model'

@Injectable()
export class OrderRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async list(userId: number, query: GetOrderListQueryType): Promise<GetOrderListResType> {
    const { page, limit, status } = query
    const skip = (page - 1) * limit
    const take = limit
    const where: Prisma.OrderWhereInput = { userId, status }

    const totalItems$ = this.prismaService.order.count({ where })
    const data$ = this.prismaService.order.findMany({
      where,
      include: { items: true },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    })

    const [data, totalItems] = await Promise.all([data$, totalItems$])

    return {
      data: data as GetOrderListResType['data'],
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    }
  }
}
