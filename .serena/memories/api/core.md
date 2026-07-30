# API

- Один NestJS REST API с глобальным `/api`; PrismaService — persistence boundary.
- Project владеет Research, Script и Scenes; Scene владеет Assets; удаления каскадные.
- ProjectsService отвечает за ownership и монотонный pipeline status.
- LlmService использует Gemini при наличии ключа и локальный fallback иначе.
- AssetsProcessor работает внутри API, concurrency 2, статусы `QUEUED -> GENERATING -> READY|FAILED`.
- Без Clerk API работает от `dev-user`; при ключе текущий guard требует `x-user-id`, token verification ещё TODO.
- PostgreSQL и Redis нужны для обычной работы API/очереди.
