import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import envConfig from '@/shared/config'
import { AppModule } from '@/app.module'
import { UPLOAD_DIR_NAME, UPLOAD_DIR_PATH } from '@/shared/constants/media.constant'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.enableCors()
  app.useStaticAssets(UPLOAD_DIR_PATH, { prefix: `/${UPLOAD_DIR_NAME}` })
  await app.listen(envConfig.PORT ?? 8000)
}
bootstrap()
