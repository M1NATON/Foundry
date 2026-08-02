# API

- Один NestJS REST API с глобальным `/api`; PrismaService — persistence boundary.
- Project владеет Research, Script, Scenes и project-level Asset'ами (базовая музыка); Scene владеет Asset'ами; удаления каскадные.
- Asset принадлежит ровно одному владельцу: `sceneId` XOR `projectId`.
- ProjectsService отвечает за ownership (`assertOwned`) и монотонный pipeline status (`advanceStatus`).
- LlmService (Gemini при ключе, локальный fallback) разбивает script на сцены и генерирует image/video промпты по voiceText; визуальный стиль передаётся вторым аргументом и вшит внутрь промптов и локальных fallback'ов, а не дописан сверху.
- Визуальный стиль: `Project.visualStyle`/`visualStyleCustom` (null = наследовать), таблица `UserSettings` (`userId @id`, без FK — модели User нет). Резолв цепочки — `ProjectsService.visualStyleFor`; модуль `settings/` отдаёт GET/PATCH `/settings` с upsert и дефолтом вместо 404.
- AssetsProcessor внутри API (concurrency 2): `QUEUED -> GENERATING -> READY|FAILED`; реальная генерация только IMAGE через Gemini, VIDEO/VOICE/MUSIC — placeholders.
- ScenesService: import (полная замена, сохраняет projectTitle/fullScript в Script), reorder, duplicate, active-asset, regeneratePrompts.
- Длительность: ffprobe для загруженных файлов (`media-duration.ts`, backfill при чтении сцен); `durationSec` сцены — от голосового файла или `estimateSpeechSeconds` (слова + паузы по пунктуации).
- Экспорт (`export/`): md/txt/json/csv/srt/prompts + FCPXML/EDL таймлайн (`timeline.ts`, абсолютные пути к uploads, базовый трек один раз без зацикливания).
- Без Clerk API работает от `dev-user`; при ключе текущий guard требует `x-user-id`, token verification ещё TODO.
- PostgreSQL и Redis нужны для обычной работы API/очереди.
- PostgreSQL и Redis нужны для обычной работы API/очереди.
