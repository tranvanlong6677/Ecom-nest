import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { UsersRepository } from '@/routes/users/users.repo'
import { SharedRolesRepository } from '@/shared/repository/shared-role.repo'

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, SharedRolesRepository],
})
export class UsersModule {}
