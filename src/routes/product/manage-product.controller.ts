import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import { ALL_LANGUAGE_CODE } from '@/shared/constants/other.constants'
import type { AccessTokenPayload } from '@/shared/types/jwt.type'
import { ManageProductService } from './manage-product.service'
import {
  CreateProductBodyDTO,
  DeleteProductQueryDTO,
  GetManageProductsQueryDTO,
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductsResDTO,
  ProductDTO,
  UpdateProductBodyDTO,
} from './product.dto'

@Controller('manage-product/products')
export class ManageProductController {
  constructor(private readonly manageProductService: ManageProductService) {}

  @Get()
  @ZodSerializerDto(GetProductsResDTO)
  list(
    @Query() query: GetManageProductsQueryDTO,
    @ActiveUser() user: AccessTokenPayload,
    @Headers('accept-language') languageId: string = ALL_LANGUAGE_CODE,
  ) {
    return this.manageProductService.list(query, {
      userIdRequest: user.userId,
      roleNameRequest: user.roleName,
      languageId,
    })
  }

  @Get(':productId')
  @ZodSerializerDto(GetProductDetailResDTO)
  findById(
    @Param() params: GetProductParamsDTO,
    @ActiveUser() user: AccessTokenPayload,
    @Headers('accept-language') languageId: string = ALL_LANGUAGE_CODE,
  ) {
    return this.manageProductService.getDetail({
      productId: params.productId,
      languageId,
      userIdRequest: user.userId,
      roleNameRequest: user.roleName,
    })
  }

  @Post()
  @ZodSerializerDto(GetProductDetailResDTO)
  create(@Body() body: CreateProductBodyDTO, @ActiveUser('userId') userId: number) {
    return this.manageProductService.create(body, userId)
  }

  @Put(':productId')
  @ZodSerializerDto(ProductDTO)
  update(
    @Param() params: GetProductParamsDTO,
    @Body() body: UpdateProductBodyDTO,
    @ActiveUser() user: AccessTokenPayload,
  ) {
    return this.manageProductService.update({
      productId: params.productId,
      data: body,
      userIdRequest: user.userId,
      roleNameRequest: user.roleName,
    })
  }

  @Delete(':productId')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetProductParamsDTO,
    @Query() query: DeleteProductQueryDTO,
    @ActiveUser() user: AccessTokenPayload,
  ) {
    return this.manageProductService.delete({
      productId: params.productId,
      userIdRequest: user.userId,
      roleNameRequest: user.roleName,
      isHard: query.hardDelete,
    })
  }
}
