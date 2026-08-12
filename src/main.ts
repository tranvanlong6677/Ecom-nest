import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { cleanupOpenApiDoc } from 'nestjs-zod'
import helmet from 'helmet'
import envConfig from '@/shared/config'
import { AppModule } from '@/app.module'
import { WebsocketAdapter } from './websockets/websocket.adapter'
import { ConsoleLogger } from '@nestjs/common'
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor'
import { Logger } from 'nestjs-pino'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  app.enableCors()
  const websocketAdapter = new WebsocketAdapter(app)
  app.useWebSocketAdapter(websocketAdapter)
  app.use(helmet())
  // app.useGlobalInterceptors(new LoggingInterceptor())
  app.useLogger(app.get(Logger))
  const swaggerConfig = new DocumentBuilder()
    .setTitle(envConfig.APP_NAME)
    .setDescription(`${envConfig.APP_NAME} API documentation`)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Payment webhook API key, sent as: Bearer <PAYMENT_API_KEY>',
      },
      'payment-api-key',
    )
    .build()
  const swaggerDocument = cleanupOpenApiDoc(SwaggerModule.createDocument(app, swaggerConfig))
  SwaggerModule.setup('api-docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  await app.listen(envConfig.PORT ?? 8000)
}
bootstrap()
