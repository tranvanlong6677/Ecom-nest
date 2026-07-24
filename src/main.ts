import { NestFactory } from '@nestjs/core'
import envConfig from '@/shared/config'
import { AppModule } from '@/app.module'
import { WebsocketAdapter } from './websockets/websocket.adapter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  const websocketAdapter = new WebsocketAdapter(app)
  app.useWebSocketAdapter(websocketAdapter)
  await app.listen(envConfig.PORT ?? 8000)
}
bootstrap()
