# Shared Types

- `packages/shared-types/src/index.ts` экспортирует Zod schemas, DTO/types, enums и helpers.
- Здесь канонические Project/Scene/Asset statuses и порядок pipeline stages.
- Изменения cross-boundary payload сначала вносятся здесь, затем синхронизируются с Prisma/API/web.
- Помощники домена живут здесь же и обязаны быть единственным источником правды: `estimateSpeechSeconds` (длительность по тексту с пунктуацией), `sceneDuration` (измеренный голос иначе оценка), `activeAssetOf`/`ACTIVE_ASSET_FIELD_BY_TYPE`, `sceneReadiness`, `projectGaps`, `musicForScene`/`projectMusicShortfall`, `storyboardPromptMode`/`buildStoryboardPrompt`/`buildScriptFromTopicPrompt`, `SCRIPT_LANGUAGES`, `SCRIPT_LENGTH_PRESETS`, `EXPORT_FORMATS`.
- Визуальный стиль (`visual-style.ts`): `VISUAL_STYLE_PRESETS` (расширяется одной записью), `resolveVisualStyle`/`visualStyleHint`/`visualStyleBlock`, `effectiveVisualStyle` (проект -> дефолт пользователя -> `DEFAULT_VISUAL_STYLE`). Стиль подставляется в промпт вместо просьбы к модели придумать визуальный мир самой; требование не переключать стиль между сценами осталось.
- Настройки пользователя (`settings.ts`): `UserSettingsSchema`, `DEFAULT_USER_SETTINGS` — пока только стиль для новых проектов.
- Пакет нужно собрать до зависимых проверок, потому что приложения используют exports из `dist`.
