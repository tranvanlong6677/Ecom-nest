import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { LanguageService } from './language.service'
import {
  CreateLanguageBodyDTO,
  GetLanguageParamsDTO,
  GetLanguagesResDTO,
  LanguageResDTO,
  UpdateLanguageBodyDTO,
} from './language.dto'
import { IsPublic } from '@/shared/decorators/auth.decorator'
import { ActiveUser } from '@/shared/decorators/active-user.decorator'
import { MessageResDTO } from '@/shared/dtos/response.dto'

@Controller('languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetLanguagesResDTO)
  findAll() {
    return this.languageService.findAll()
  }

  @Get(':languageId')
  @IsPublic()
  @ZodSerializerDto(LanguageResDTO)
  findById(@Param() params: GetLanguageParamsDTO) {
    return this.languageService.findById(params.languageId)
  }

  @Post()
  @ZodSerializerDto(LanguageResDTO)
  create(@Body() body: CreateLanguageBodyDTO, @ActiveUser('userId') userId: number) {
    return this.languageService.create(body, userId)
  }

  @Put(':languageId')
  @ZodSerializerDto(LanguageResDTO)
  update(
    @Param() params: GetLanguageParamsDTO,
    @Body() body: UpdateLanguageBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.languageService.update(params.languageId, body, userId)
  }

  @Delete(':languageId')
  @ZodSerializerDto(MessageResDTO)
  delete(@Param() params: GetLanguageParamsDTO, @ActiveUser('userId') userId: number) {
    return this.languageService.delete(params.languageId, userId)
  }
}
