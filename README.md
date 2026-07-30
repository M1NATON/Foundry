# Foundry

Foundry — рабочее пространство для производства YouTube-видео по единому
пайплайну:

**Research -> Script -> Storyboard -> Scenes -> Assets -> Export**

Текущая версия — MVP, ориентированный на полный локальный сценарий работы.
Приложение запускается без внешних API-ключей: для разбивки сценария есть
детерминированный фолбэк, генерация ассетов возвращает локальные SVG-заглушки,
а BullMQ при этом обрабатывает настоящие асинхронные задания и статусы.

## Стек

| Область | Технологии |
| --- | --- |
| Workspace | pnpm 11, Turborepo 2, TypeScript 5.9 |
| Web | Next.js 15 App Router, React 19, Tailwind CSS, TanStack Query, Framer Motion |
| API | NestJS 11, Prisma 6, PostgreSQL 16 |
| Очереди | BullMQ 5, Redis 7; worker работает внутри процесса API |
| Контракт | Общие Zod-схемы в `@foundry/shared-types` |
| Тесты | Vitest 4 и V8 coverage |

## Требования

- Node.js 20 или новее;
- pnpm 11.15.1;
- Docker с Docker Compose.

## Локальный запуск

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm db:up
pnpm --filter @foundry/shared-types build
pnpm db:migrate
pnpm dev
```

После запуска доступны:

- web: http://localhost:3000;
- API: http://localhost:4000/api;
- PostgreSQL: `localhost:5432`;
- Redis: `localhost:6379`.

Проверить состояние контейнеров:

```bash
docker compose ps
```

## Переменные окружения

Настройки для разработки описаны в `apps/api/.env.example`.

| Переменная | Значение по умолчанию / пример | Назначение |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL на `localhost:5432` | Подключение Prisma |
| `REDIS_HOST` | `localhost` | Подключение BullMQ |
| `REDIS_PORT` | `6379` | Подключение BullMQ |
| `PORT` | `4000` | Порт API |
| `WEB_ORIGIN` | `http://localhost:3000` | Разрешённый CORS origin |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api` | Базовый URL API для web |
| `GEMINI_API_KEY` | пусто | Опциональная разбивка сценария и генерация изображений через Gemini |
| `CLERK_SECRET_KEY` | пусто | Отключает режим пользователя `dev-user` |

Если `CLERK_SECRET_KEY` пуст, все запросы выполняются от `dev-user`. Проверка
токенов Clerk пока не реализована: при заданном ключе текущий guard требует
заголовок `x-user-id`. Это точка для будущей интеграции, а не готовая
production-аутентификация.

Если `GEMINI_API_KEY` пуст или Gemini отвечает ошибкой:

- абзацы сценария локально преобразуются в сцены;
- генерация ассетов возвращает SVG-заглушки в токенах дизайн-системы;
- очередь сохраняет реальные переходы `QUEUED -> GENERATING -> READY`;
- web поллит незавершённые ассеты через TanStack Query.

## Команды

| Команда | Назначение |
| --- | --- |
| `pnpm dev` | Запустить watchers web, API и shared-types |
| `pnpm build` | Выполнить production-сборку всего workspace |
| `pnpm typecheck` | Выполнить строгую проверку TypeScript |
| `pnpm test` | Один раз запустить все unit-тесты через Turborepo |
| `pnpm test:watch` | Запустить Vitest в watch-режиме |
| `pnpm test:coverage` | Построить текстовый, HTML- и LCOV-отчёты покрытия |
| `pnpm db:up` | Запустить PostgreSQL и Redis |
| `pnpm db:down` | Остановить PostgreSQL и Redis |
| `pnpm db:migrate` | Применить Prisma-миграции для разработки |
| `pnpm db:generate` | Перегенерировать Prisma Client |
| `pnpm db:studio` | Открыть Prisma Studio |

HTML-отчёт покрытия создаётся в `coverage/index.html`. Workflow
`.github/workflows/ci.yml` автоматически запускает тесты, typecheck и
production build для pull request и push в `main`.

## Структура workspace

```text
apps/web                 Next.js: библиотека проектов и редактор сцен
apps/api                 NestJS REST API, Prisma и BullMQ worker
packages/shared-types    Zod-схемы, DTO, enum и общие функции
```

API намеренно остаётся одним процессом. Выносить BullMQ worker в отдельное
приложение следует только тогда, когда генерация начнёт мешать HTTP-нагрузке.

## Поток данных

1. Проект содержит опциональные записи research и script.
2. При сохранении сценария сервер рассчитывает количество слов и длительность.
3. Сценарий можно разбить локально или через Gemini либо импортировать JSON-раскадровку.
4. Упорядоченные сцены принадлежат проекту и содержат сгенерированные или загруженные ассеты.
5. BullMQ обрабатывает задания ассетов и обновляет статусы ассета и сцены.
6. Проект экспортируется в Markdown, text, JSON, CSV или SRT.

Доступ к проектам ограничен по `userId`, а статус пайплайна монотонно
продвигается от `DRAFT` до `READY`.

## REST API

Все маршруты имеют префикс `/api`.

| Метод | Маршрут | Назначение |
| --- | --- | --- |
| `GET`, `POST` | `/projects` | Получить список или создать проект |
| `GET`, `PATCH`, `DELETE` | `/projects/:id` | Получить, изменить или удалить проект |
| `GET`, `PUT` | `/projects/:id/research` | Получить или сохранить research |
| `GET`, `PUT` | `/projects/:id/script` | Получить или сохранить сценарий |
| `POST` | `/projects/:id/script/split-into-scenes` | Пересобрать сцены из сценария |
| `GET`, `POST` | `/projects/:id/scenes` | Получить список или создать сцену |
| `POST` | `/projects/:id/scenes/import` | Импортировать JSON-раскадровку |
| `PATCH`, `DELETE` | `/scenes/:id` | Изменить или удалить сцену |
| `POST` | `/scenes/reorder` | Изменить порядок сцен |
| `POST` | `/scenes/:id/assets` | Поставить генерацию ассета в очередь |
| `POST` | `/scenes/:id/assets/upload` | Прикрепить готовый файл |
| `GET`, `DELETE` | `/assets/:id` | Проверить статус или удалить ассет |
| `POST` | `/projects/:id/export` | Экспортировать в `md`, `txt`, `json`, `csv` или `srt` |

## Дизайн-система

Палитра в `apps/web/tailwind.config.ts` заменяет стандартные цвета Tailwind, а
не расширяет их. В интерфейсе следует использовать только проектные токены.
Для заголовков используется Fraunces, для интерфейса — Inter. Фиксированная
шкала размеров: 13/15/17/21/28/40/64. Акцентный цвет применяется точечно.
