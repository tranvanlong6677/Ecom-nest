-- Step 1: Tạo bảng Device trước
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "userAgent" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "lastActive" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Step 2: Thêm deviceId nullable trước (để tránh lỗi với data cũ)
ALTER TABLE "RefreshToken" ADD COLUMN "deviceId" INTEGER;

-- Step 3: Tạo placeholder Device cho mỗi userId đang có trong RefreshToken
INSERT INTO "Device" ("userId", "userAgent", "ip", "lastActive", "isActive")
SELECT DISTINCT "userId", 'unknown', 'unknown', NOW(), false
FROM "RefreshToken";

-- Step 4: Gán deviceId cho các token cũ dựa theo userId
UPDATE "RefreshToken" rt
SET "deviceId" = d."id"
FROM "Device" d
WHERE d."userId" = rt."userId";

-- Step 5: Đặt NOT NULL sau khi đã fill đủ data
ALTER TABLE "RefreshToken" ALTER COLUMN "deviceId" SET NOT NULL;

-- Step 6: Thêm foreign key
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
