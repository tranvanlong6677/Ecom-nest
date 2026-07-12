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
import { MediaModule } from './routes/media/media.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 20,
      },
    ]),
    SharedModule,
    AuthModule,
    BrandModule,
    BrandTranslationModule,
    CategoryModule,
    CategoryTranslationModule,
    LanguageModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UsersModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SharedRolesRepository,
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
