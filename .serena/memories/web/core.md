# Web

- Next.js App Router: `/` — библиотека, `/projects/[id]/editor` — полноэкранный редактор.
- Редактор — 4 взаимоисключающих этапа-вида (`EditorWorkspace`): research, script, storyboard, producing; пустой проект открывается на script.
- Шапка: `EditorChrome` + статичный `PipelineStepper` (этапы + Readiness/Import/Export + тема light/dark из localStorage).
- TanStack Query hooks в `src/lib/queries`; сцены читаются одним кешем списка сцен и канвасом, и инспектором, и таймлайном.
- EditorProvider хранит только UI-state: step, tool, selectedSceneId, timelineZoom, theme.
- Живые текстовые поля сцены — через `useSceneField` (debounce 400мс, модульная история Ctrl+Z, дописывание при размонтировании).
- Producing: Stage (voiceover на холсте, переключатель Frame/Clip, оверлей промптов), Timeline (зум Ctrl+колесо, drop файла на сцену, MusicLane/MusicBar), InspectorPanel (Generate/Upload вкладки, SceneMusicOverride, Alt+←/→).
- Music живёт на проекте (`queries/music.ts`), а не на сцене.
- Визуальный стиль выбирается общим `VisualStyleField`: в Import storyboard он пишется в проект, в модалке настроек библиотеки — в дефолт пользователя (`queries/settings.ts`). Оба места, где собирается промпт (модалка импорта и Script view), передают стиль и язык — расходиться им нельзя.
- ExportPanel: группы Timeline (FCPXML, EDL) и Document (md/txt/json/csv/srt/prompts).
- Palette полностью задаётся `tailwind.config.ts`; произвольные цвета и размеры не добавлять.
- Fraunces — display, Inter — UI; сохранять редакционный workbench-язык интерфейса.
- Palette полностью задаётся `tailwind.config.ts`; произвольные цвета и размеры не добавлять.
- Fraunces — display, Inter — UI; сохранять редакционный workbench-язык интерфейса.
