import { BrandIncludeTranslationSchema } from '@/shared/models/brand.model'
import { createZodDto } from 'nestjs-zod'
import {
  CreateBrandBodySchema,
  DeleteBrandQuerySchema,
  GetBrandParamsSchema,
  GetBrandsQuerySchema,
  GetBrandsResSchema,
  UpdateBrandBodySchema,
} from './brand.model'

export class GetBrandsResDTO extends createZodDto(GetBrandsResSchema) {}

export class GetBrandsQueryDTO extends createZodDto(GetBrandsQuerySchema) {}

export class GetBrandParamsDTO extends createZodDto(GetBrandParamsSchema) {}

export class DeleteBrandQueryDTO extends createZodDto(DeleteBrandQuerySchema) {}

export class CreateBrandBodyDTO extends createZodDto(CreateBrandBodySchema) {}

export class UpdateBrandBodyDTO extends createZodDto(UpdateBrandBodySchema) {}

export class BrandResDTO extends createZodDto(BrandIncludeTranslationSchema) {}
