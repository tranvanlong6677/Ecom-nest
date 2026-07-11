import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { BrandService } from './brand.service'
import {
  BrandResDTO,
  CreateBrandBodyDTO,
  DeleteBrandQueryDTO,
  GetBrandParamsDTO,
  GetBrandsQueryDTO,
  GetBrandsResDTO,
  UpdateBrandBodyDTO,
} from './brand.dto'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetBrandsResDTO)
  findAll(@Query() query: GetBrandsQueryDTO) {
    return this.brandService.findAll(query)
  }

  @Get(':brandId')
  @IsPublic()
  @ZodSerializerDto(BrandResDTO)
  findById(@Param() params: GetBrandParamsDTO) {
    return this.brandService.findById(params.brandId)
  }

  @Post()
  @ZodSerializerDto(BrandResDTO)
  create(@Body() body: CreateBrandBodyDTO, @ActiveUser('userId') userId: number) {
    return this.brandService.create(body, userId)
  }

  @Put(':brandId')
  @ZodSerializerDto(BrandResDTO)
  update(
    @Param() params: GetBrandParamsDTO,
    @Body() body: UpdateBrandBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.brandService.update(params.brandId, body, userId)
  }

  @Delete(':brandId')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetBrandParamsDTO,
    @Query() query: DeleteBrandQueryDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.brandService.delete(params.brandId, userId, query.hardDelete)
  }
}
