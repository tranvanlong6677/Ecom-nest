import { createZodDto } from 'nestjs-zod'
import { BrandTranslationSchema } from '@/shared/models/brand-translation.model'
import {
  CreateBrandTranslationBodySchema,
  DeleteBrandTranslationQuerySchema,
  GetBrandTranslationParamsSchema,
  UpdateBrandTranslationBodySchema,
} from './brand-translation.model'

export class GetBrandTranslationParamsDTO extends createZodDto(GetBrandTranslationParamsSchema) {}

export class DeleteBrandTranslationQueryDTO extends createZodDto(DeleteBrandTranslationQuerySchema) {}

export class CreateBrandTranslationBodyDTO extends createZodDto(CreateBrandTranslationBodySchema) {}

export class UpdateBrandTranslationBodyDTO extends createZodDto(UpdateBrandTranslationBodySchema) {}

export class BrandTranslationResDTO extends createZodDto(BrandTranslationSchema) {}
