# Web

- Next.js App Router: `/` — библиотека, `/projects/[id]/editor` — полноэкранный редактор.
- TanStack Query hooks находятся в `src/lib/queries`; mutations инвалидируют domain и project detail caches.
- EditorProvider хранит только выбранный tool и scene id.
- Palette полностью задаётся `tailwind.config.ts`; произвольные цвета и размеры не добавлять.
- Fraunces — display, Inter — UI; сохранять редакционный workbench-язык интерфейса.
