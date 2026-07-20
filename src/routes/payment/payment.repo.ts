import { PrismaService } from '@/shared/services/prisma.service'
import { Injectable } from '@nestjs/common'
import { WebhookPaymentBodyType } from './payment.model'
import { MessageResType } from '@/shared/models/response.model'
import { parse } from 'date-fns'
import { PREFIX_PAYMENT_CODE } from '@/shared/constants/other.constants'
import { PaymentException } from '@/shared/models/error.model'
import { OrderIncludeProductSKUSnapshotType } from '@/shared/models/order.model'
import { PaymentStatus } from '@/shared/constants/payment.constant'
import { OrderStatus } from '../order/order.constant'

@Injectable()
export class PaymentRepository {
  constructor(private readonly prismaService: PrismaService) {}
  private getTotalPrice(orders: OrderIncludeProductSKUSnapshotType[]) {
    const ordersPrice = orders.reduce((acc, order) => {
      const orderPrice = order.items.reduce((totalPrice, productSku) => {
        return totalPrice + productSku.skuPrice * productSku.quantity
      }, 0)
      return acc + orderPrice
    }, 0)
    return ordersPrice
  }
  async receiver(data: WebhookPaymentBodyType): Promise<
    MessageResType & {
      paymentId: number
    }
  > {
    //   1: Thêm thông tin giao dịch vào DB
    let amountIn = 0
    let amountOut = 0
    if (data.transferType === 'in') {
      amountIn = data.transferAmount
    } else if (data.transferType === 'out') {
      amountOut = data.transferAmount
    }
    await this.prismaService.paymentTransaction.create({
      data: {
        gateway: data.gateway,
        transactionDate: parse(data.transactionDate, 'yyyy-MM-dd HH:mm:ss', new Date()),
        accountNumber: data.accountNumber || '',
        subAccount: data.subAccount,
        amountIn,
        amountOut,
        accumulated: data.accumulated,
        code: data.code,
        transactionContent: data.content,
        referenceNumber: data.referenceCode,
        body: data.description,
      },
    })

    // 2: Kiểm tra nội dung chuyển khoản và số tiền xem có khớp với đơn hàng không
    const paymentId = data.code
      ? Number(data.code.split(PREFIX_PAYMENT_CODE)[1])
      : Number(data.content?.split(PREFIX_PAYMENT_CODE)[1])

    if (isNaN(paymentId)) {
      throw PaymentException.CannotGetPaymentId
    }

    const payment = await this.prismaService.payment.findUnique({
      where: { id: paymentId },
      include: {
        orders: {
          include: {
            items: true,
          },
        },
      },
    })

    if (!payment) {
      throw PaymentException.NotFoundPayment
    }

    const orders = payment.orders as OrderIncludeProductSKUSnapshotType[]
    const totalPrice = this.getTotalPrice(orders)
    console.log({ totalPrice })
    if (totalPrice !== data.transferAmount) {
      throw PaymentException.TotalPriceNotMatch
    }

    // 3: Cập nhật trạng thái đơn hàng
    await this.prismaService.$transaction([
      this.prismaService.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: PaymentStatus.SUCCESS,
        },
      }),
      this.prismaService.order.updateMany({
        where: {
          id: { in: orders.map((order) => order.id) },
        },
        data: {
          status: OrderStatus.PENDING_PICKUP,
        },
      }),
    ])
    return { message: 'Payment data received successfully', paymentId }
  }
}
