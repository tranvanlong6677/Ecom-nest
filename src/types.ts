/* eslint-disable @typescript-eslint/no-namespace */
import { VariantsType } from '@/routes/product/product.model'

declare global {
  namespace PrismaJson {
    type Variants = VariantsType
  }
}
