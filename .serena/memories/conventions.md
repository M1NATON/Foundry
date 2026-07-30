# Соглашения

- Выбирать минимальную явную MVP-реализацию без преждевременных слоёв.
- Zod-схемы и inferred types в shared-types — канонический REST-контракт.
- Каждый project-scoped API вызов проверяет ownership по `userId`.
- Статус проекта продвигается монотонно через `ProjectsService.advanceStatus`.
- Server state web хранится в TanStack Query; локальные tool/selection — в EditorProvider.
- Strict TypeScript, двойные кавычки и точки с запятой.
- UI использует только проектные Tailwind-токены и существующий визуальный язык.
