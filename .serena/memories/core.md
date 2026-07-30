# Foundry

- MVP-воркспейс производства YouTube-видео: Research -> Script -> Storyboard/Scenes -> Assets -> Export.
- pnpm/Turborepo monorepo: `apps/web`, `apps/api`, `packages/shared-types`.
- Архитектура намеренно простая: один NestJS REST API, BullMQ worker внутри API, без GraphQL/CQRS/microservices.
- Общий web/API контракт: `mem:shared_types/core`.
- API, persistence и очереди: `mem:api/core`.
- Web/editor и дизайн-инварианты: `mem:web/core`.
- Стек и тесты: `mem:tech_stack`; команды: `mem:suggested_commands`; gate завершения: `mem:task_completion`.
- После изменения исходников запускать `graphify update .`.
