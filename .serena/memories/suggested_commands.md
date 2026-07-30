# Команды

- `pnpm install` — зависимости.
- `pnpm db:up` / `pnpm db:down` — PostgreSQL `5432` и Redis `6379`.
- `pnpm db:migrate`, `pnpm db:generate`, `pnpm db:studio` — Prisma.
- `pnpm dev` — все watchers.
- `pnpm test`, `pnpm test:watch`, `pnpm test:coverage` — тесты.
- `pnpm typecheck`, `pnpm build` — обязательные проверки.
- `graphify update .` — обновить граф после исходников.
- Root `pnpm lint` пока не выполняет задач: package-level lint scripts отсутствуют.
