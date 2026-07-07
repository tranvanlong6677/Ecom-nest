-- Partial unique index: chi rang buoc unique tren cac permission dang active
-- (deletedAt IS NULL). Cho phep tao lai permission voi path+method giong
-- mot permission da bi soft-delete truoc do.
CREATE UNIQUE INDEX "Permission_path_method_active_key"
ON "Permission"("path", "method")
WHERE "deletedAt" IS NULL;
