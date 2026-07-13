import { Controller, Get, Headers, Param, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { ALL_LANGUAGE_CODE } from '@/shared/constants/other.constants'
import { ProductService } from './product.service'
import { GetProductDetailResDTO, GetProductParamsDTO, GetProductsQueryDTO, GetProductsResDTO } from './product.dto'

@Controller('products')
@IsPublic()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ZodSerializerDto(GetProductsResDTO)
  list(@Query() query: GetProductsQueryDTO, @Headers('accept-language') languageId: string = ALL_LANGUAGE_CODE) {
    return this.productService.list(query, languageId)
  }

  @Get(':productId')
  @ZodSerializerDto(GetProductDetailResDTO)
  findById(@Param() params: GetProductParamsDTO, @Headers('accept-language') languageId: string = ALL_LANGUAGE_CODE) {
    return this.productService.getDetail(params.productId, languageId)
  }
}
