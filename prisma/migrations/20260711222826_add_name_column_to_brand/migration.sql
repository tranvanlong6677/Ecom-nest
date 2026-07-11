-- AlterTable
-- The "name" column was originally added in the init migration but was
-- dropped by migration `20260630074102` and never re-added, even though
-- `schema.prisma` still declares it as a required field. Brand table is
-- currently empty, so adding it back as NOT NULL is safe.
ALTER TABLE "Brand" ADD COLUMN "name" VARCHAR(500) NOT NULL;
