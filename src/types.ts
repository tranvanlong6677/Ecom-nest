/* eslint-disable @typescript-eslint/no-namespace */
import { VariantsType } from '@/shared/models/product.model'
import { ProductTranslationType } from './shared/models/product-translation.model'

declare global {
  namespace PrismaJson {
    type Variants = VariantsType
    type ProductTranslations = Pick<ProductTranslationType, 'id' | 'name' | 'description' | 'languageId'>[]
    type Receiver = {
      name: string
      phone: string
      address: string
    }
  }
}
