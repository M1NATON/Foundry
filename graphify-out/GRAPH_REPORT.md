# Graph Report - Foundry  (2026-08-02)

## Corpus Check
- 145 files · ~187,263 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1094 nodes · 2014 edges · 73 communities (58 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8fc956cc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UserId
- foundry_design_prompt.md
- asset.ts
- dependencies
- devDependencies
- Инструменты (MCP-серверы и хуки)
- inspector-panel.tsx
- compilerOptions
- compilerOptions
- dependencies
- foundry_development_prompt.md
- app/layout.tsx
- scripts
- import-storyboard-dialog.tsx
- ProjectsController
- scripts
- ExportService
- ScriptsController
- shared-types/package.json
- app.module.ts
- editor-workspace.test.tsx
- ResearchController
- compilerOptions
- nest-cli.json
- 8. Как работает backend
- button.tsx
- compilerOptions
- Memory Maintenance
- Foundry: полное описание проекта для нейросети
- llm.service.ts
- Foundry
- next-env.d.ts
- tailwind.config.ts
- assets.controller.ts
- timeline.tsx
- scene.ts
- AssetsProcessor
- storyboard.ts
- ScenesService
- ProjectsService
- api/package.json
- api/core.md
- 4. Маршруты сайта
- 5.8. Этап Producing
- shared_types/core.md
- zod
- ioredis
- rxjs
- web/core.md
- conventions.md
- Foundry
- primitives.tsx
- readiness-panel.tsx
- helpers.test.ts
- 9. REST API
- suggested_commands.md
- task_completion.md
- 6. Сущности и связи данных
- project.ts
- 5. Карта кнопок и элементов управления
- tech_stack.md
- SettingsService
- editor-store.tsx
- upload.ts
- src/settings.ts
- .assertOwned
- cn
- PrismaModule
- @foundry/shared-types
- music-track.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 47 edges
2. `UserId` - 39 edges
3. `useEditor()` - 26 edges
4. `ProjectsService` - 25 edges
5. `PrismaService` - 22 edges
6. `ExportService` - 21 edges
7. `ScenesService` - 21 edges
8. `compilerOptions` - 20 edges
9. `Foundry: полное описание проекта для нейросети` - 20 edges
10. `AssetsService` - 19 edges

## Surprising Connections (you probably didn't know these)
- `ReadinessBadge()` --references--> `SCENE_ASSET_SLOTS`  [EXTRACTED]
  apps/web/src/components/editor/readiness-badge.tsx → packages/shared-types/src/scene.ts
- `VisualStyleField()` --references--> `VISUAL_STYLE_PRESETS`  [EXTRACTED]
  apps/web/src/components/scenes/visual-style-field.tsx → packages/shared-types/src/visual-style.ts
- `parseSources()` --references--> `SourceSchema`  [EXTRACTED]
  apps/api/src/research/research.service.ts → packages/shared-types/src/research.ts
- `parseStoryboard()` --references--> `StoryboardImportSchema`  [EXTRACTED]
  apps/api/src/scenes/scenes.service.ts → packages/shared-types/src/storyboard.ts
- `SceneTextarea()` --calls--> `cn()`  [EXTRACTED]
  apps/web/src/components/editor/inspector-panel.tsx → apps/web/src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (73 total, 15 thin omitted)

### Community 0 - "UserId"
Cohesion: 0.20
Nodes (11): UserId, ProjectScenesController, ScenesController, Body, Controller, Delete, Get, Param (+3 more)

### Community 1 - "foundry_design_prompt.md"
Cohesion: 0.20
Nodes (9): COLOR — exact tokens, CORE SCREENS TO DESIGN (in this order), HARD BANS — DO NOT USE ANY OF THESE, LAYOUT PRINCIPLES, MOTION, OUTPUT FOR THIS PASS, ROLE, TECH STACK (+1 more)

### Community 2 - "asset.ts"
Cohesion: 0.13
Nodes (16): ASSET_PENDING_STATUSES, AssetSchema, CreateAssetDto, CreateAssetSchema, GenerateMissingDto, GenerateMissingSchema, isAssetPending(), AssetStatus (+8 more)

### Community 3 - "dependencies"
Cohesion: 0.04
Nodes (45): @foundry/shared-types, @types/node, typescript, zod, autoprefixer, clsx, framer-motion, dependencies (+37 more)

### Community 4 - "devDependencies"
Cohesion: 0.11
Nodes (19): @types/node, typescript, devDependencies, @nestjs/cli, @nestjs/schematics, prisma, ts-node, tsconfig-paths (+11 more)

### Community 5 - "Инструменты (MCP-серверы и хуки)"
Cohesion: 0.22
Nodes (8): context7 (MCP) — актуальная документация библиотек, graphify (MCP + хуки) — граф знаний кодовой базы, rtk (хук, если установлен) — сжатие вывода команд, Serena (MCP) — семантическая навигация по коду, Инструменты (MCP-серверы и хуки), Общие правила, Оркестрация задач (если CLI поддерживает делегирование подагентам), Приоритет при исследовании кода (обязательный порядок)

### Community 6 - "inspector-panel.tsx"
Cohesion: 0.07
Nodes (47): ACCEPT_FOR, ASSET_KINDS, AssetKind, GENERATE_TOOLS, InspectorPanel(), InspectorPanelProps, kindOfTool(), OPEN_TOOLS (+39 more)

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (26): dist, ES2022, node_modules, src/**/*.ts, compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration (+18 more)

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (27): ES2022, node_modules, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx (+19 more)

### Community 9 - "dependencies"
Cohesion: 0.12
Nodes (17): bullmq, dependencies, bullmq, multer, @nestjs/common, @nestjs/config, @nestjs/core, @nestjs/platform-express (+9 more)

### Community 10 - "foundry_development_prompt.md"
Cohesion: 0.22
Nodes (8): API DESIGN, DATA MODEL (Prisma) — exact shape, implement as-is unless something is clearly missing, FOLDER STRUCTURE, FRONTEND STATE, HARD BANS — DO NOT DO ANY OF THESE, MVP BUILD ORDER — build in this sequence, each step usable before moving on, ROLE, STACK (already decided, don't relitigate)

### Community 11 - "app/layout.tsx"
Cohesion: 0.08
Nodes (24): nextConfig, fraunces, inter, metadata, Providers(), dependsOn, outputs, cache (+16 more)

### Community 12 - "scripts"
Cohesion: 0.06
Nodes (30): devDependencies, prettier, turbo, typescript, vitest, @vitest/coverage-v8, engines, node (+22 more)

### Community 13 - "import-storyboard-dialog.tsx"
Cohesion: 0.16
Nodes (21): EditorPage(), EditorWorkspace(), ScriptView(), ScriptViewProps, SettingsDialog(), SettingsDialogProps, ImportStoryboardDialog(), ImportStoryboardDialogProps (+13 more)

### Community 14 - "ProjectsController"
Cohesion: 0.13
Nodes (9): ProjectsController, Body, Controller, Delete, Get, Param, Patch, Post (+1 more)

### Community 15 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, prisma:generate, prisma:migrate, start, test, typecheck

### Community 16 - "ExportService"
Cohesion: 0.08
Nodes (24): ExportController, Body, Controller, Param, Post, UseGuards, ExportResult, ExportService (+16 more)

### Community 17 - "ScriptsController"
Cohesion: 0.18
Nodes (8): ScriptsController, Body, Controller, Get, Param, Post, Put, UseGuards

### Community 18 - "shared-types/package.json"
Cohesion: 0.10
Nodes (19): dependencies, zod, devDependencies, typescript, exports, files, main, name (+11 more)

### Community 19 - "app.module.ts"
Cohesion: 0.15
Nodes (16): AssetsModule, Module, ExportModule, Module, LlmModule, Module, ProjectsModule, Module (+8 more)

### Community 20 - "editor-workspace.test.tsx"
Cohesion: 0.11
Nodes (18): nextKey(), ResearchView(), ResearchViewProps, SourceRow, SourceRowItemProps, toRows(), api, ApiError (+10 more)

### Community 21 - "ResearchController"
Cohesion: 0.22
Nodes (7): ResearchController, Body, Controller, Get, Param, Put, UseGuards

### Community 22 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, lib, module, moduleResolution, noEmit, skipLibCheck (+5 more)

### Community 23 - "nest-cli.json"
Cohesion: 0.29
Nodes (6): collection, compilerOptions, deleteOutDir, webpack, $schema, sourceRoot

### Community 24 - "8. Как работает backend"
Cohesion: 0.29
Nodes (7): 8. Как работает backend, Persistence, Генерация, Длительности, Загрузка файлов, Очередь ассетов, Экспорт таймлайна

### Community 25 - "button.tsx"
Cohesion: 0.33
Nodes (5): ButtonProps, Size, SIZES, Variant, VARIANTS

### Community 26 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, noEmit, outDir, rootDir, extends, include, src/**/*.ts, ./tsconfig.json

### Community 27 - "Memory Maintenance"
Cohesion: 0.33
Nodes (5): Add/update threshold, Discovery Model, Maintenance Actions, Memory Maintenance, Style

### Community 28 - "Foundry: полное описание проекта для нейросети"
Cohesion: 0.12
Nodes (15): 10. Авторизация и ownership, 11. Frontend-архитектура, 12. Backend-архитектура, 13. Технологический стек, 14. Основные переменные окружения, 15. Команды разработки, 16. Важные ограничения и незавершённые части, 17. Правила для нейросети, которая будет менять проект (+7 more)

### Community 29 - "llm.service.ts"
Cohesion: 0.19
Nodes (12): firstSentence(), GeminiResponseSchema, LlmScene, LlmSceneSchema, LlmScenesSchema, LlmService, localPrompts(), promptsPrompt() (+4 more)

### Community 30 - "Foundry"
Cohesion: 0.18
Nodes (10): Foundry, REST API, Дизайн-система, Команды, Локальный запуск, Переменные окружения, Поток данных, Стек (+2 more)

### Community 35 - "assets.controller.ts"
Cohesion: 0.29
Nodes (5): AuthedRequest, AuthGuard, Injectable, Injectable, ZodValidationPipe

### Community 36 - "timeline.tsx"
Cohesion: 0.16
Nodes (18): EditorWorkspaceProps, ProducingView(), ProducingViewProps, SceneListItemProps, StoryboardListView(), StoryboardListViewProps, clampZoom(), SceneCard (+10 more)

### Community 37 - "scene.ts"
Cohesion: 0.10
Nodes (26): Asset, activeAssetOf(), assetDurationDrift(), CreateSceneDto, CreateSceneSchema, GAP_LABEL, hasDurationMismatch(), hasMusicOverride() (+18 more)

### Community 38 - "AssetsProcessor"
Cohesion: 0.20
Nodes (9): AssetsProcessor, Injectable, AssetJobData, redisConnection(), escapeXml(), placeholderAsset(), toDataUrl(), truncate() (+1 more)

### Community 39 - "storyboard.ts"
Cohesion: 0.12
Nodes (26): buildScriptFromTopicPrompt(), buildStoryboardPrompt(), ImportStoryboardDto, ImportStoryboardSchema, optionalText, outputLanguage(), SCRIPT_LANGUAGES, SCRIPT_LENGTH_PRESETS (+18 more)

### Community 42 - "ProjectsService"
Cohesion: 0.18
Nodes (9): PrismaService, Injectable, ProjectsService, Injectable, ResearchService, Injectable, WITH_ASSETS, ScriptsService (+1 more)

### Community 43 - "api/package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 45 - "4. Маршруты сайта"
Cohesion: 0.50
Nodes (4): 4. Маршруты сайта, `/` — Project Library, `/projects/{id}/editor` — основной редактор, `/projects/{id}` — технический redirect

### Community 46 - "5.8. Этап Producing"
Cohesion: 0.50
Nodes (4): 5.8. Этап Producing, Инспектор (InspectorPanel), Канвас (Stage), Таймлайн (Timeline)

### Community 54 - "primitives.tsx"
Cohesion: 0.11
Nodes (22): LibraryPage(), EmptyLibrary(), EmptyLibraryProps, NewProjectRow(), NewProjectRowProps, Cover(), hashTone(), ProjectCard() (+14 more)

### Community 55 - "readiness-panel.tsx"
Cohesion: 0.16
Nodes (11): BATCH, FillTheGaps(), ReadinessPanel(), ReadinessPanelProps, ExportPanel(), ExportPanelProps, ExportResult, GROUPS (+3 more)

### Community 56 - "helpers.test.ts"
Cohesion: 0.11
Nodes (19): parseStoryboard(), hasDefaultTitle(), SCENE_ASSET_SLOTS, countSpokenWords(), countWords(), estimateSeconds(), estimateSpeechSeconds(), formatDuration() (+11 more)

### Community 57 - "9. REST API"
Cohesion: 0.25
Nodes (8): 9. REST API, Assets, Export, Music (проект), Projects, Research, Scenes, Script

### Community 60 - "6. Сущности и связи данных"
Cohesion: 0.33
Nodes (6): 6. Сущности и связи данных, Asset, Project, Research, Scene, Script

### Community 61 - "project.ts"
Cohesion: 0.12
Nodes (13): ProjectStatus, CreateProjectDto, CreateProjectSchema, Project, ProjectListItem, ProjectListItemSchema, ProjectMusic, ProjectMusicSchema (+5 more)

### Community 62 - "5. Карта кнопок и элементов управления"
Cohesion: 0.20
Nodes (10): 5.10. Экспорт (ExportPanel), 5.1. Библиотека проектов, 5.2. Верхняя панель редактора (EditorChrome), 5.3. Левая панель (LeftRail), 5.4. Этап Research (ResearchView), 5.5. Этап Script (ScriptView), 5.6. Диалог Import storyboard, 5.7. Этап Storyboard (StoryboardListView) (+2 more)

### Community 64 - "SettingsService"
Cohesion: 0.16
Nodes (8): SettingsController, Body, Controller, Get, Patch, UseGuards, SettingsService, Injectable

### Community 65 - "editor-store.tsx"
Cohesion: 0.18
Nodes (10): EditorChrome(), EditorChromeProps, PipelineStepper(), PipelineStepperProps, EditorContext, EditorProvider(), EditorState, EditorStep (+2 more)

### Community 66 - "upload.ts"
Cohesion: 0.22
Nodes (6): AppModule, Module, ALLOWED, AUDIO_EXT, IMAGE_EXT, VIDEO_EXT

### Community 67 - "src/settings.ts"
Cohesion: 0.29
Nodes (6): DEFAULT_USER_SETTINGS, UpdateUserSettingsDto, UpdateUserSettingsSchema, UserSettings, UserSettingsSchema, VisualStyleKeySchema

### Community 68 - ".assertOwned"
Cohesion: 0.06
Nodes (34): AssetsController, ProjectAssetsController, ProjectMusicController, SceneAssetsController, Body, Controller, Delete, Get (+26 more)

### Community 69 - "cn"
Cohesion: 0.16
Nodes (13): LeftRail(), ReadinessBadge(), readyTrack(), Stage(), StageProps, withUrl(), AssetMedia(), AssetMediaProps (+5 more)

### Community 70 - "PrismaModule"
Cohesion: 0.67
Nodes (3): PrismaModule, Module, Global

### Community 73 - "music-track.tsx"
Cohesion: 0.16
Nodes (21): BarProps, LaneProps, MusicBar(), MusicLane(), SceneMusicOverride(), TakeChip(), plan(), PlannedScene (+13 more)

## Knowledge Gaps
- **395 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `webpack` (+390 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SCENE_ASSET_SLOTS` connect `helpers.test.ts` to `scene.ts`, `cn`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **Why does `ReadinessBadge()` connect `cn` to `helpers.test.ts`, `timeline.tsx`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **Why does `AssetType` connect `.assertOwned` to `asset.ts`, `scene.ts`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _395 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `asset.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13157894736842105 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._