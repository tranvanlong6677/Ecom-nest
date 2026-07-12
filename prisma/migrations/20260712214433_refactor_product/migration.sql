-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_createdById_fkey";
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_productId_fkey";
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_updatedById_fkey";
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "VariantOption" DROP CONSTRAINT "VariantOption_variantId_fkey";
ALTER TABLE "VariantOption" DROP CONSTRAINT "VariantOption_createdById_fkey";
ALTER TABLE "VariantOption" DROP CONSTRAINT "VariantOption_updatedById_fkey";
ALTER TABLE "VariantOption" DROP CONSTRAINT "VariantOption_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "_SKUToVariantOption" DROP CONSTRAINT "_SKUToVariantOption_A_fkey";
ALTER TABLE "_SKUToVariantOption" DROP CONSTRAINT "_SKUToVariantOption_B_fkey";

-- DropTable
DROP TABLE "_SKUToVariantOption";

-- DropTable
DROP TABLE "VariantOption";

-- DropTable
DROP TABLE "Variant";

-- AlterTable
-- Product/SKU tables are currently empty, so adding new NOT NULL columns
-- without a default is safe (would otherwise lose data).
ALTER TABLE "Product" DROP COLUMN "base_price";
ALTER TABLE "Product" DROP COLUMN "virtual_price";
ALTER TABLE "Product" ADD COLUMN "name" VARCHAR(500) NOT NULL;
ALTER TABLE "Product" ADD COLUMN "basePrice" DOUBLE PRECISION NOT NULL;
ALTER TABLE "Product" ADD COLUMN "virtualPrice" DOUBLE PRECISION NOT NULL;
ALTER TABLE "Product" ADD COLUMN "variants" JSONB NOT NULL;
ALTER TABLE "Product" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SKU" DROP COLUMN "images";
ALTER TABLE "SKU" ADD COLUMN "image" TEXT NOT NULL;

-- CreateIndex
-- Partial unique index: chi rang buoc unique tren cac product translation dang active
-- (deletedAt IS NULL). Cho phep tao lai ban dich sau khi ban dich cu bi soft-delete.
CREATE UNIQUE INDEX "ProductTranslation_productId_languageId_active_key"
ON "ProductTranslation"("productId", "languageId")
WHERE "deletedAt" IS NULL;

-- CreateIndex
-- Partial unique index: trong cung 1 product, value (to hop bien the) cua SKU phai
-- duy nhat, chi ap dung cho cac SKU dang active (deletedAt IS NULL).
CREATE UNIQUE INDEX "SKU_productId_value_active_key"
ON "SKU"("productId", "value")
WHERE "deletedAt" IS NULL;
