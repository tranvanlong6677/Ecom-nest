import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { CategoryTranslationService } from './category-translation.service'
import {
  CategoryTranslationResDTO,
  CreateCategoryTranslationBodyDTO,
  DeleteCategoryTranslationQueryDTO,
  GetCategoryTranslationParamsDTO,
  UpdateCategoryTranslationBodyDTO,
} from './category-translation.dto'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'

@Controller('category-translations')
export class CategoryTranslationController {
  constructor(private readonly categoryTranslationService: CategoryTranslationService) {}

  @Get(':categoryTranslationId')
  @IsPublic()
  @ZodSerializerDto(CategoryTranslationResDTO)
  findById(@Param() params: GetCategoryTranslationParamsDTO) {
    return this.categoryTranslationService.findById(params.categoryTranslationId)
  }

  @Post()
  @ZodSerializerDto(CategoryTranslationResDTO)
  create(@Body() body: CreateCategoryTranslationBodyDTO, @ActiveUser('userId') userId: number) {
    return this.categoryTranslationService.create(body, userId)
  }

  @Put(':categoryTranslationId')
  @ZodSerializerDto(CategoryTranslationResDTO)
  update(
    @Param() params: GetCategoryTranslationParamsDTO,
    @Body() body: UpdateCategoryTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.categoryTranslationService.update(params.categoryTranslationId, body, userId)
  }

  @Delete(':categoryTranslationId')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetCategoryTranslationParamsDTO,
    @Query() query: DeleteCategoryTranslationQueryDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.categoryTranslationService.delete(params.categoryTranslationId, userId, query.hardDelete)
  }
}
