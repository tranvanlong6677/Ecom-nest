import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
@WebSocketGateway({ namespace: 'payment' })
export class PaymentGateway
//  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect 
 {
    @WebSocketServer()
    server: Server;

    // afterInit(server: Server) {
    //     console.log('Websocket Payment is ready')
    // }

    // handleConnection(client: Socket) {
    //     console.log('Client payment connected: ', client.id)
    // }

    // handleDisconnect(client: Socket) {
    //     console.log('Client payment disconnected: ', client.id)
    // }

    @SubscribeMessage('send-money')
    handleEvent(@MessageBody() data: string): string {
        this.server.emit('receive-money', {
            data: `Money: ${data}`
        })

        return data
    }
}