# Стек

- Node.js >=20, pnpm 11.15.1, Turborepo 2.5.6, TypeScript 5.9.2.
- Web: Next.js 15.5.4, React 19.1.1, TanStack Query, Tailwind 3.4, Framer Motion.
- API: NestJS 11, Prisma/PostgreSQL 6, BullMQ 5, Redis/ioredis.
- Контракт: Zod 3 в `packages/shared-types`, сборка в `dist`.
- Тесты: Vitest 4.1.6, V8 coverage; GitHub Actions запускает test/typecheck/build.
