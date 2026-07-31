-- AlterTable
ALTER TABLE "public"."Asset" ADD COLUMN     "projectId" TEXT,
ALTER COLUMN "sceneId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "activeMusicId" TEXT;

-- CreateIndex
CREATE INDEX "Asset_projectId_createdAt_idx" ON "public"."Asset"("projectId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Asset" ADD CONSTRAINT "Asset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Перенос уже существующей музыки со сцен на проект.
-- Правило: музыка выбрана во всех сценах проекта и это один и тот же файл —
-- значит это и был базовый трек, просто продублированный по сценам. Разнобой
-- не трогаем: там музыка действительно точечная и остаётся override'ом сцены.
WITH per_project AS (
  SELECT
    s."projectId"           AS project_id,
    COUNT(*)                AS scenes,
    COUNT(m.id)             AS scenes_with_music,
    COUNT(DISTINCT m."url") AS distinct_tracks,
    MIN(m.id)               AS keep_asset_id
  FROM "public"."Scene" s
  LEFT JOIN "public"."Asset" m
    ON m.id = s."activeMusicId" AND m."url" IS NOT NULL
  GROUP BY s."projectId"
), promoted AS (
  SELECT project_id, keep_asset_id
  FROM per_project
  WHERE scenes > 0
    AND scenes_with_music = scenes
    AND distinct_tracks = 1
)
UPDATE "public"."Project" p
SET "activeMusicId" = promoted.keep_asset_id
FROM promoted
WHERE p.id = promoted.project_id;

-- Выбранный трек переезжает со сцены на проект. Его копии в остальных сценах
-- остаются лежать там же неактивными вариантами — ничего не удаляем.
UPDATE "public"."Asset" a
SET "projectId" = p.id, "sceneId" = NULL
FROM "public"."Project" p
WHERE p."activeMusicId" = a.id;

-- Сцены такого проекта больше не держат музыку сами.
UPDATE "public"."Scene" s
SET "activeMusicId" = NULL
FROM "public"."Project" p
WHERE s."projectId" = p.id
  AND p."activeMusicId" IS NOT NULL;
