-- AlterTable
-- Category table is currently empty, so adding "name" back as NOT NULL is safe.
ALTER TABLE "Category" ADD COLUMN "name" VARCHAR(500) NOT NULL;
ALTER TABLE "Category" ADD COLUMN "logo" VARCHAR(1000);

-- Partial unique index: chi rang buoc unique tren cac category translation dang active
-- (deletedAt IS NULL). Cho phep tao lai ban dich voi cung categoryId+languageId sau khi
-- ban dich cu bi soft-delete.
CREATE UNIQUE INDEX "CategoryTranslation_categoryId_languageId_active_key"
ON "CategoryTranslation"("categoryId", "languageId")
WHERE "deletedAt" IS NULL;
