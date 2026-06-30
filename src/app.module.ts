import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from './shared/shared.module'
import { AuthModule } from './routes/auth/auth.module'
import { RolesService } from './routes/auth/role.service'

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, RolesService],
})
export class AppModule {}
