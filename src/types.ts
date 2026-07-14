/* eslint-disable @typescript-eslint/no-namespace */
import { VariantsType } from '@/shared/models/product.model'

declare global {
  namespace PrismaJson {
    type Variants = VariantsType
  }
}
