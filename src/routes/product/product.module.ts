import { Module } from '@nestjs/common'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'
import { ProductRepo } from './product.repo'
import { ManageProductController } from './manage-product.controller'
import { ManageProductService } from './manage-product.service'

@Module({
  controllers: [ProductController, ManageProductController],
  providers: [ProductService, ManageProductService, ProductRepo],
})
export class ProductModule {}
