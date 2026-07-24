import { SharedWebsocketRepository } from '@/shared/repository/shared-websocket.repo'
import { TokenService } from '@/shared/services/token.service'
import { INestApplicationContext } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { Server, ServerOptions } from 'socket.io'

const namespaces = [
  { name: 'default', path: '/' },
  { name: 'payment', path: '/payment' },
  { name: 'chat', path: '/chat' },
]

export class WebsocketAdapter extends IoAdapter {
  private readonly sharedWebsocketRepository: SharedWebsocketRepository
  private readonly tokenService: TokenService
  constructor(app: INestApplicationContext) {
    super(app)
    this.sharedWebsocketRepository = app.get(SharedWebsocketRepository)
    this.tokenService = app.get(TokenService)
  }

  async authMiddleware(socket: any, next: (err?: Error) => void) {
    const authorization = socket.handshake.headers.authorization
    if (!authorization) {
      return next(new Error('Thiếu Authorization header'))
    }

    const accessToken = authorization.split(' ')[1]
    if (!accessToken) {
      return next(new Error('Thiếu access token'))
    }
    try {
      const { userId } = await this.tokenService.verifyAccessToken(accessToken)
      await this.sharedWebsocketRepository.create({
        id: socket.id,
        userId,
      })
      socket.on('disconnect', async () => {
        await this.sharedWebsocketRepository.delete(socket.id).catch(() => {})
      })
      next()
    } catch (error) {
      next(error)
    }
  }
  createIOServer(port: number, options?: ServerOptions): Server {
    const server: Server = super.createIOServer(4000, {
      ...options,
      cors: {
        origin: '*',
        credentials: true,
      },
    })

    namespaces.forEach((namespace) => {
      server.of(namespace.path).use(this.authMiddleware.bind(this))
    })
    return server
  }
}
