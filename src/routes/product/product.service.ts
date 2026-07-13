import { Injectable } from '@nestjs/common'
import { ProductException } from '@/shared/models/error.model'
import { ProductRepo } from './product.repo'
import { GetProductsQueryType } from './product.model'

@Injectable()
export class ProductService {
  constructor(private readonly productRepo: ProductRepo) {}

  list(query: GetProductsQueryType, languageId: string) {
    return this.productRepo.list({ query, languageId, isPublic: true })
  }

  async getDetail(productId: number, languageId: string) {
    const product = await this.productRepo.getDetail({ productId, languageId, isPublic: true })
    if (!product) {
      throw ProductException.NotFound
    }
    return product
  }
}
