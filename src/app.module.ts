import { Module } from '@nestjs/common'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { SharedModule } from '@/shared/shared.module'
import { AuthModule } from '@/routes/auth/auth.module'
import { BrandModule } from '@/routes/brand/brand.module'
import { BrandTranslationModule } from '@/routes/brand-translation/brand-translation.module'
import { CategoryModule } from '@/routes/category/category.module'
import { CategoryTranslationModule } from '@/routes/category-translation/category-translation.module'
import { LanguageModule } from '@/routes/language/language.module'
import { PermissionModule } from '@/routes/permission/permission.module'
import { ProductModule } from '@/routes/product/product.module'
import { ProductTranslationModule } from '@/routes/product/product-translation/product-translation.module'
import { RoleModule } from '@/routes/role/role.module'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import CustomZodValidationPipe from '@/shared/pipes/custom-zod-validation.pipe'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { HttpExceptionFilter } from '@/shared/filters/http-exception.filter'
import { TransformInterceptor } from '@/shared/interceptors/transform.interceptor'
import { CatchEverythingFilter } from '@/shared/filters/catch-everything.filter'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { ProfileModule } from './routes/profile/profile.module'
import { SharedRolesRepository } from './shared/repository/shared-role.repo'
import { UsersModule } from './routes/users/users.module'
import { MediaModule } from './routes/media/media.module'
import { CartModule } from './routes/cart/cart.module'
import { OrderModule } from './routes/order/order.module'
import { PaymentModule } from './routes/payment/payment.module'
import { BullModule } from '@nestjs/bullmq'
import { PaymentConsumer } from './queues/payment.consumer'
import { WebsocketsModule } from './websockets/websockets.module'
import { ReviewModule } from './routes/review/review.module'
import { CronjobsModule } from './cronjobs/cronjobs.module'
import { CacheModule } from '@nestjs/cache-manager'
import KeyvRedis from '@keyv/redis'
import { Keyv } from 'keyv'
import { KeyvCacheableMemory } from 'cacheable'
import envConfig from './shared/config'
import { LoggerModule } from 'nestjs-pino'
import path from 'path'
import pino from 'pino'

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        serializers: {
          req(req: any) {
            return {
              method: req.method,
              url: req.url,
              query: req.query,
              params: req.params,
            }
          },
          res(res: any) {
            return {
              statusCode: res.statusCode,
            }
          },
        },
        stream: pino.destination({
          dest: path.resolve('logs/app.log'),
          sync: false, // Asynchronous logging
          mkdir: true, // Create the directory if it doesn't exist
        }),
      },
    }),
    // CacheModule.register({ isGlobal: true }), // cache in memory
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          stores: [
            new Keyv({
              store: new KeyvCacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis(envConfig.REDIS_URL),
          ],
        }
      },
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    SharedModule,
    AuthModule,
    BrandModule,
    BrandTranslationModule,
    CategoryModule,
    CategoryTranslationModule,
    LanguageModule,
    PermissionModule,
    ProductModule,
    ProductTranslationModule,
    RoleModule,
    ProfileModule,
    UsersModule,
    MediaModule,
    CartModule,
    OrderModule,
    PaymentModule,
    WebsocketsModule,
    ReviewModule,
    CronjobsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SharedRolesRepository,
    PaymentConsumer,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
  ],
})
export class AppModule {}
