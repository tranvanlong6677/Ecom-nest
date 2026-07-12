import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { CategoryService } from './category.service'
import {
  CategoryResDTO,
  CreateCategoryBodyDTO,
  DeleteCategoryQueryDTO,
  GetCategoriesQueryDTO,
  GetCategoriesResDTO,
  GetCategoryParamsDTO,
  GetCategoryTreeResDTO,
  UpdateCategoryBodyDTO,
} from './category.dto'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetCategoriesResDTO)
  findAll(@Query() query: GetCategoriesQueryDTO) {
    return this.categoryService.findAll(query.parentCategoryId)
  }

  @Get('tree')
  @IsPublic()
  @ZodSerializerDto(GetCategoryTreeResDTO)
  getTree() {
    return this.categoryService.getTree()
  }

  @Get(':categoryId')
  @IsPublic()
  @ZodSerializerDto(CategoryResDTO)
  findById(@Param() params: GetCategoryParamsDTO) {
    return this.categoryService.findById(params.categoryId)
  }

  @Post()
  @ZodSerializerDto(CategoryResDTO)
  create(@Body() body: CreateCategoryBodyDTO, @ActiveUser('userId') userId: number) {
    return this.categoryService.create(body, userId)
  }

  @Put(':categoryId')
  @ZodSerializerDto(CategoryResDTO)
  update(
    @Param() params: GetCategoryParamsDTO,
    @Body() body: UpdateCategoryBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.categoryService.update(params.categoryId, body, userId)
  }

  @Delete(':categoryId')
  @ZodSerializerDto(MessageResDTO)
  delete(
    @Param() params: GetCategoryParamsDTO,
    @Query() query: DeleteCategoryQueryDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.categoryService.delete(params.categoryId, userId, query.hardDelete)
  }
}
