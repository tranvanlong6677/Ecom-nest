import { Module } from '@nestjs/common'
import { CartService } from './cart.service'
import { CartController } from './cart.controller'
import { CartRepo } from './cart.repo'

@Module({
  controllers: [CartController],
  providers: [CartService, CartRepo],
})
export class CartModule {}
