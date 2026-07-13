import { Module } from '@nestjs/common'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'
import { ProductRepo } from './product.repo'

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepo],
})
export class ProductModule {}
