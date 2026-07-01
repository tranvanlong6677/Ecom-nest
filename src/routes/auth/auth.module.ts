import { Module } from '@nestjs/common'
import { AuthService } from '@/routes/auth/auth.service'
import { AuthController } from '@/routes/auth/auth.controller'
import { RolesService } from '@/routes/auth/role.service'
import { AuthRepository } from './auth.repo'

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesService, AuthRepository],
})
export class AuthModule {}
