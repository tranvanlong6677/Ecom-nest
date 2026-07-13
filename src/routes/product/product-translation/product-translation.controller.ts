import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { ProductTranslationService } from './product-translation.service'
import {
  CreateProductTranslationBodyDTO,
  DeleteProductTranslationQueryDTO,
  GetProductTranslationParamsDTO,
  ProductTranslationResDTO,
  UpdateProductTranslationBodyDTO,
} from './product-translation.dto'

@Controller('product-translations')
export class ProductTranslationController {
  constructor(private readonly productTranslationService: ProductTranslationService) {}

  @Get(':productTranslationId')
  @IsPublic()
  @ZodSerializerDto(ProductTranslationResDTO)
  findById(@Param() params: GetProductTranslationParamsDTO) {
    return this.productTranslationService.findById(params.productTranslationId)
  }

  @Post()
  @ZodSerializerDto(ProductTranslationResDTO)
  create(@Body() body: CreateProductTranslationBodyDTO, @ActiveUser('userId') userId: number) {
    return this.productTranslationService.create(body, userId)
  }

  @Put(':productTranslationId')
  @ZodSerializerDto(ProductTranslationResDTO)
  update(
    @Param() params: GetProductTranslationParamsDTO,
    @Body() body: UpdateProductTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.productTranslationService.update(params.productTranslationId, body, userId)
  }

  @Delete(':productTranslationId')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetProductTranslationParamsDTO,
    @Query() query: DeleteProductTranslationQueryDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.productTranslationService.delete(params.productTranslationId, userId, query.hardDelete)
  }
}
