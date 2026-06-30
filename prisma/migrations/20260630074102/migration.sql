/*
  Warnings:

  - The values [PENDING_PAYMENT] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `deletedById` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `BrandTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `CategoryTranslation` table. All the data in the column will be lost.
  - The primary key for the `Language` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deletedById` on the `Language` table. All the data in the column will be lost.
  - The `id` column on the `Language` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `deletedById` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `receiver` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shopId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `module` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `basePrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `variants` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `virtualPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `ProductSKUSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `ProductSKUSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `productTranslations` on the `ProductSKUSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `ProductSKUSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `skuPrice` on the `ProductSKUSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `ProductTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `deviceId` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `updateCount` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `SKU` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `SKU` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `UserTranslation` table. All the data in the column will be lost.
  - You are about to drop the `Device` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReviewMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Websocket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OrderToProduct` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `Language` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[totpSecret]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `VerificationCode` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `languageId` on the `BrandTranslation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `languageId` on the `CategoryTranslation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `code` to the `Language` table without a default value. This is not possible if the table is not empty.
  - Made the column `accountNumber` on table `PaymentTransaction` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `base_price` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `virtual_price` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `ProductSKUSnapshot` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `languageId` on the `ProductTranslation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `languageId` on the `UserTranslation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `VerificationCode` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RegistrationCodeType" AS ENUM ('REGISTER', 'FORGOT_PASSWORD');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING_CONFIRMATION', 'PENDING_PICKUP', 'PENDING_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED');
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Brand" DROP CONSTRAINT "Brand_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "BrandTranslation" DROP CONSTRAINT "BrandTranslation_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "BrandTranslation" DROP CONSTRAINT "BrandTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_skuId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "CategoryTranslation" DROP CONSTRAINT "CategoryTranslation_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "CategoryTranslation" DROP CONSTRAINT "CategoryTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_userId_fkey";

-- DropForeignKey
ALTER TABLE "Language" DROP CONSTRAINT "Language_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_shopId_fkey";

-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "ProductSKUSnapshot" DROP CONSTRAINT "ProductSKUSnapshot_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductTranslation" DROP CONSTRAINT "ProductTranslation_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "ProductTranslation" DROP CONSTRAINT "ProductTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewMedia" DROP CONSTRAINT "ReviewMedia_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "SKU" DROP CONSTRAINT "SKU_createdById_fkey";

-- DropForeignKey
ALTER TABLE "SKU" DROP CONSTRAINT "SKU_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "UserTranslation" DROP CONSTRAINT "UserTranslation_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "UserTranslation" DROP CONSTRAINT "UserTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "Websocket" DROP CONSTRAINT "Websocket_userId_fkey";

-- DropForeignKey
ALTER TABLE "_OrderToProduct" DROP CONSTRAINT "_OrderToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrderToProduct" DROP CONSTRAINT "_OrderToProduct_B_fkey";

-- DropIndex
DROP INDEX "Brand_deletedAt_idx";

-- DropIndex
DROP INDEX "BrandTranslation_deletedAt_idx";

-- DropIndex
DROP INDEX "CartItem_userId_idx";

-- DropIndex
DROP INDEX "CartItem_userId_skuId_key";

-- DropIndex
DROP INDEX "Category_deletedAt_idx";

-- DropIndex
DROP INDEX "CategoryTranslation_deletedAt_idx";

-- DropIndex
DROP INDEX "Language_deletedAt_idx";

-- DropIndex
DROP INDEX "Order_deletedAt_idx";

-- DropIndex
DROP INDEX "Order_status_deletedAt_idx";

-- DropIndex
DROP INDEX "Permission_deletedAt_idx";

-- DropIndex
DROP INDEX "Product_deletedAt_idx";

-- DropIndex
DROP INDEX "ProductTranslation_deletedAt_idx";

-- DropIndex
DROP INDEX "ProductTranslation_productId_idx";

-- DropIndex
DROP INDEX "Review_orderId_productId_key";

-- DropIndex
DROP INDEX "Review_productId_idx";

-- DropIndex
DROP INDEX "Review_userId_idx";

-- DropIndex
DROP INDEX "Role_deletedAt_idx";

-- DropIndex
DROP INDEX "SKU_deletedAt_idx";

-- DropIndex
DROP INDEX "SKU_productId_idx";

-- DropIndex
DROP INDEX "User_deletedAt_idx";

-- DropIndex
DROP INDEX "UserTranslation_deletedAt_idx";

-- DropIndex
DROP INDEX "VerificationCode_email_type_key";

-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "deletedById",
DROP COLUMN "name";

-- AlterTable
ALTER TABLE "BrandTranslation" DROP COLUMN "deletedById",
DROP COLUMN "languageId",
ADD COLUMN     "languageId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "deletedById",
DROP COLUMN "logo",
DROP COLUMN "name";

-- AlterTable
ALTER TABLE "CategoryTranslation" DROP COLUMN "deletedById",
DROP COLUMN "languageId",
ADD COLUMN     "languageId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Language" DROP CONSTRAINT "Language_pkey",
DROP COLUMN "deletedById",
ADD COLUMN     "code" VARCHAR(10) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Language_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "deletedById",
DROP COLUMN "paymentId",
DROP COLUMN "receiver",
DROP COLUMN "shopId";

-- AlterTable
ALTER TABLE "PaymentTransaction" ALTER COLUMN "accountNumber" SET NOT NULL;

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "deletedById",
DROP COLUMN "module",
ALTER COLUMN "description" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "basePrice",
DROP COLUMN "deletedById",
DROP COLUMN "name",
DROP COLUMN "publishedAt",
DROP COLUMN "variants",
DROP COLUMN "virtualPrice",
ADD COLUMN     "base_price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "virtual_price" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProductSKUSnapshot" DROP COLUMN "image",
DROP COLUMN "productId",
DROP COLUMN "productTranslations",
DROP COLUMN "quantity",
DROP COLUMN "skuPrice",
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "ProductTranslation" DROP COLUMN "deletedById",
DROP COLUMN "languageId",
ADD COLUMN     "languageId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "deviceId";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "orderId",
DROP COLUMN "updateCount";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "deletedById",
ALTER COLUMN "description" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SKU" DROP COLUMN "deletedById",
DROP COLUMN "image",
ADD COLUMN     "images" TEXT[],
ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deletedById";

-- AlterTable
ALTER TABLE "UserTranslation" DROP COLUMN "deletedById",
DROP COLUMN "languageId",
ADD COLUMN     "languageId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "VerificationCode" DROP COLUMN "type",
ADD COLUMN     "type" "RegistrationCodeType" NOT NULL;

-- DropTable
DROP TABLE "Device";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "ReviewMedia";

-- DropTable
DROP TABLE "Websocket";

-- DropTable
DROP TABLE "_OrderToProduct";

-- DropEnum
DROP TYPE "MediaType";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "VerificationCodeType";

-- CreateTable
CREATE TABLE "Variant" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariantOption" (
    "id" SERIAL NOT NULL,
    "value" VARCHAR(500) NOT NULL,
    "variantId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariantOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SKUToVariantOption" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SKUToVariantOption_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SKUToVariantOption_B_index" ON "_SKUToVariantOption"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_totpSecret_key" ON "User"("totpSecret");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationCode_email_key" ON "VerificationCode"("email");

-- CreateIndex
CREATE INDEX "VerificationCode_email_code_type_idx" ON "VerificationCode"("email", "code", "type");

-- AddForeignKey
ALTER TABLE "UserTranslation" ADD CONSTRAINT "UserTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductTranslation" ADD CONSTRAINT "ProductTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "VariantOption" ADD CONSTRAINT "VariantOption_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "VariantOption" ADD CONSTRAINT "VariantOption_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "VariantOption" ADD CONSTRAINT "VariantOption_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SKU" ADD CONSTRAINT "SKU_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "BrandTranslation" ADD CONSTRAINT "BrandTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "SKU"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_SKUToVariantOption" ADD CONSTRAINT "_SKUToVariantOption_A_fkey" FOREIGN KEY ("A") REFERENCES "SKU"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SKUToVariantOption" ADD CONSTRAINT "_SKUToVariantOption_B_fkey" FOREIGN KEY ("B") REFERENCES "VariantOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
