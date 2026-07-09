-- Drop the existing full-table unique index generated from `email @unique`
DROP INDEX "User_email_key";

-- Replace it with a partial unique index so a soft-deleted user no longer blocks
-- another user (or a re-created account) from reusing the same email
CREATE UNIQUE INDEX "User_email_key" ON "User"("email") WHERE "deletedAt" IS NULL;
