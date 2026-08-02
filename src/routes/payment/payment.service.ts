import { Injectable } from '@nestjs/common'
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model'
import { PaymentRepository } from './payment.repo'
import { SharedWebsocketRepository } from '@/shared/repository/shared-websocket.repo'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { generatePaymentRoomName } from '@/shared/helper'

@Injectable()
@WebSocketGateway({
  namespace: 'payment',
})
export class PaymentService {
  @WebSocketServer()
  server: Server

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly sharedWebsocketRepository: SharedWebsocketRepository,
  ) {}

  async receiver(body: WebhookPaymentBodyType) {
    const userId = await this.paymentRepo.receiver(body)
    const roomName = generatePaymentRoomName(userId)
    this.server.to(roomName).emit('payment', {
      status: 'success',
    })
    // try {
    //   const websockets = await this.sharedWebsocketRepository.findMany(userId)
    //   websockets.forEach((ws) => {
    //     this.server.to(ws.id).emit('payment', {
    //       status: 'success',
    //     })
    //   })
    // } catch (error) {
    //   console.log({ error })
    // }

    return {
      message: 'Payment  success',
    }
  }
}
