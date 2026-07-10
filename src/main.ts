import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import envConfig from '@/shared/config'
import { AppModule } from '@/app.module'
import { UPLOAD_DIR_NAME } from '@/shared/constants/media.constant'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.enableCors()
  app.useStaticAssets(join(process.cwd(), UPLOAD_DIR_NAME), { prefix: `/${UPLOAD_DIR_NAME}` })
  await app.listen(envConfig.PORT ?? 8000)
}
bootstrap()
