-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('DRAFT', 'RESEARCH', 'SCRIPTING', 'STORYBOARDING', 'PRODUCING', 'READY');

-- CreateEnum
CREATE TYPE "public"."SceneStatus" AS ENUM ('PENDING', 'GENERATING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."AssetType" AS ENUM ('IMAGE', 'VIDEO', 'VOICE', 'MUSIC');

-- CreateEnum
CREATE TYPE "public"."AssetStatus" AS ENUM ('QUEUED', 'GENERATING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coverUrl" TEXT,
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Research" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sources" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,

    CONSTRAINT "Research_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Script" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "estSeconds" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Script_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Scene" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "voiceText" TEXT NOT NULL,
    "imagePrompt" TEXT,
    "videoPrompt" TEXT,
    "durationSec" INTEGER,
    "status" "public"."SceneStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Asset" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "type" "public"."AssetType" NOT NULL,
    "provider" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "status" "public"."AssetStatus" NOT NULL DEFAULT 'QUEUED',
    "url" TEXT,
    "errorMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_userId_updatedAt_idx" ON "public"."Project"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Research_projectId_key" ON "public"."Research"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Script_projectId_key" ON "public"."Script"("projectId");

-- CreateIndex
CREATE INDEX "Scene_projectId_order_idx" ON "public"."Scene"("projectId", "order");

-- CreateIndex
CREATE INDEX "Asset_sceneId_createdAt_idx" ON "public"."Asset"("sceneId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Research" ADD CONSTRAINT "Research_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Script" ADD CONSTRAINT "Script_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Scene" ADD CONSTRAINT "Scene_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Asset" ADD CONSTRAINT "Asset_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "public"."Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;
