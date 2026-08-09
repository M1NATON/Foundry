-- CreateEnum
CREATE TYPE "FrameFormat" AS ENUM ('LANDSCAPE', 'PORTRAIT');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "frameFormat" "FrameFormat" NOT NULL DEFAULT 'LANDSCAPE';
