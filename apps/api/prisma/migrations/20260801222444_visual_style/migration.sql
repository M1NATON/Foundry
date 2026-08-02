-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "visualStyle" TEXT,
ADD COLUMN     "visualStyleCustom" TEXT;

-- CreateTable
CREATE TABLE "public"."UserSettings" (
    "userId" TEXT NOT NULL,
    "defaultVisualStyle" TEXT NOT NULL,
    "defaultVisualStyleCustom" TEXT,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("userId")
);
