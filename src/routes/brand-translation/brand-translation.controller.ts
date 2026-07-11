import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { BrandTranslationService } from './brand-translation.service'
import {
  BrandTranslationResDTO,
  CreateBrandTranslationBodyDTO,
  DeleteBrandTranslationQueryDTO,
  GetBrandTranslationParamsDTO,
  UpdateBrandTranslationBodyDTO,
} from './brand-translation.dto'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'

@Controller('brand-translations')
export class BrandTranslationController {
  constructor(private readonly brandTranslationService: BrandTranslationService) {}

  @Get(':brandTranslationId')
  @IsPublic()
  @ZodSerializerDto(BrandTranslationResDTO)
  findById(@Param() params: GetBrandTranslationParamsDTO) {
    return this.brandTranslationService.findById(params.brandTranslationId)
  }

  @Post()
  @ZodSerializerDto(BrandTranslationResDTO)
  create(@Body() body: CreateBrandTranslationBodyDTO, @ActiveUser('userId') userId: number) {
    return this.brandTranslationService.create(body, userId)
  }

  @Put(':brandTranslationId')
  @ZodSerializerDto(BrandTranslationResDTO)
  update(
    @Param() params: GetBrandTranslationParamsDTO,
    @Body() body: UpdateBrandTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.brandTranslationService.update(params.brandTranslationId, body, userId)
  }

  @Delete(':brandTranslationId')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetBrandTranslationParamsDTO,
    @Query() query: DeleteBrandTranslationQueryDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.brandTranslationService.delete(params.brandTranslationId, userId, query.hardDelete)
  }
}
