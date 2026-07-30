# Shared Types

- `packages/shared-types/src/index.ts` экспортирует Zod schemas, DTO/types, enums и helpers.
- Здесь канонические Project/Scene/Asset statuses и порядок pipeline stages.
- Изменения cross-boundary payload сначала вносятся здесь, затем синхронизируются с Prisma/API/web.
- Пакет нужно собрать до зависимых проверок, потому что приложения используют exports из `dist`.
