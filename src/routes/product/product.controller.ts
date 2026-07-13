import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { ALL_LANGUAGE_CODE } from '@/shared/constants/other.constants'
import { ProductService } from './product.service'
import {
  CreateProductBodyDTO,
  DeleteProductQueryDTO,
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductsQueryDTO,
  GetProductsResDTO,
  ProductDTO,
  UpdateProductBodyDTO,
} from './product.dto'

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetProductsResDTO)
  list(@Query() query: GetProductsQueryDTO, @Headers('accept-language') languageId: string = ALL_LANGUAGE_CODE) {
    return this.productService.list(query, languageId)
  }

  @Get(':productId')
  @IsPublic()
  @ZodSerializerDto(GetProductDetailResDTO)
  findById(@Param() params: GetProductParamsDTO, @Headers('accept-language') languageId: string = ALL_LANGUAGE_CODE) {
    return this.productService.findById(params.productId, languageId)
  }

  @Post()
  @ZodSerializerDto(GetProductDetailResDTO)
  create(@Body() body: CreateProductBodyDTO, @ActiveUser('userId') userId: number) {
    return this.productService.create(body, userId)
  }

  @Put(':productId')
  @ZodSerializerDto(ProductDTO)
  update(
    @Param() params: GetProductParamsDTO,
    @Body() body: UpdateProductBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.productService.update(params.productId, body, userId)
  }

  @Delete(':productId')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetProductParamsDTO,
    @Query() query: DeleteProductQueryDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.productService.delete(params.productId, userId, query.hardDelete)
  }
}
