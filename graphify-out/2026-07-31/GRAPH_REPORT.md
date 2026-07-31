# Graph Report - Foundry-opus-5  (2026-07-31)

## Corpus Check
- 116 files · ~93,319 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 941 nodes · 1546 edges · 69 communities (55 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9a5dd48a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UserId
- scripts
- enums.ts
- dependencies
- devDependencies
- Инструменты (MCP-серверы и хуки)
- AssetsProcessor
- compilerOptions
- compilerOptions
- dependencies
- api/package.json
- app/layout.tsx
- scripts
- scenes.ts
- storyboard-list-view.tsx
- storyboard.ts
- ExportService
- AssetsService
- shared-types/package.json
- app.module.ts
- editor-workspace.tsx
- cn
- compilerOptions
- bullmq
- foundry_design_prompt.md
- foundry_development_prompt.md
- tsconfig.build.json
- nest-cli.json
- Foundry: полное описание проекта для нейросети
- llm.service.ts
- Foundry
- next-env.d.ts
- tailwind.config.ts
- project.ts
- scene.ts
- useEditor
- src/research.ts
- ResearchService
- PrismaService
- Memory Maintenance
- api/core.md
- conventions.md
- memories/core.md
- shared_types/core.md
- suggested_commands.md
- task_completion.md
- tech_stack.md
- web/core.md
- ProjectsService
- export.service.ts
- inspector-panel.tsx
- src/script.ts
- 5. Карта всех кнопок и элементов управления
- 5.10. Инспектор выбранной сцены
- multer
- 5.4. Плавающая панель инструментов
- .upload
- 5.1. Библиотека проектов
- 5.3. Левая панель редактора
- 5.7. Диалог Import storyboard
- 5.6. Панель Storyboard
- @prisma/client
- reflect-metadata
- ProjectsController
- use-scene-field.ts
- PrismaModule

## God Nodes (most connected - your core abstractions)
1. `cn()` - 37 edges
2. `UserId` - 31 edges
3. `ProjectsService` - 24 edges
4. `useEditor()` - 22 edges
5. `PrismaService` - 20 edges
6. `compilerOptions` - 20 edges
7. `Foundry: полное описание проекта для нейросети` - 20 edges
8. `ScenesService` - 19 edges
9. `ExportService` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `ReadinessBadge()` --references--> `SCENE_ASSET_SLOTS`  [EXTRACTED]
  apps/web/src/components/editor/readiness-badge.tsx → packages/shared-types/src/scene.ts
- `Timeline()` --indirect_call--> `sceneDurationSec()`  [INFERRED]
  apps/web/src/components/editor/timeline.tsx → packages/shared-types/src/scene.ts
- `parseSources()` --references--> `SourceSchema`  [EXTRACTED]
  apps/api/src/research/research.service.ts → packages/shared-types/src/research.ts
- `parseStoryboard()` --references--> `StoryboardImportSchema`  [EXTRACTED]
  apps/api/src/scenes/scenes.service.ts → packages/shared-types/src/storyboard.ts
- `SceneTextarea()` --calls--> `cn()`  [EXTRACTED]
  apps/web/src/components/editor/inspector-panel.tsx → apps/web/src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (69 total, 14 thin omitted)

### Community 0 - "UserId"
Cohesion: 0.07
Nodes (26): AuthedRequest, AuthGuard, Injectable, UserId, Injectable, ZodValidationPipe, ProjectScenesController, ScenesController (+18 more)

### Community 1 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, prisma:generate, prisma:migrate, start, test, typecheck

### Community 2 - "enums.ts"
Cohesion: 0.17
Nodes (12): ASSET_PENDING_STATUSES, CreateAssetDto, CreateAssetSchema, isAssetPending(), AssetStatus, ExportFormat, PIPELINE_STAGES, PROJECT_STATUS_LABEL (+4 more)

### Community 3 - "dependencies"
Cohesion: 0.04
Nodes (45): dependencies, clsx, @foundry/shared-types, framer-motion, lucide-react, next, react, react-dom (+37 more)

### Community 4 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, @nestjs/cli, @nestjs/schematics, prisma, ts-node, tsconfig-paths, @types/express, @types/multer (+11 more)

### Community 5 - "Инструменты (MCP-серверы и хуки)"
Cohesion: 0.22
Nodes (8): context7 (MCP) — актуальная документация библиотек, graphify (MCP + хуки) — граф знаний кодовой базы, rtk (хук, если установлен) — сжатие вывода команд, Serena (MCP) — семантическая навигация по коду, Инструменты (MCP-серверы и хуки), Общие правила, Оркестрация задач (если CLI поддерживает делегирование подагентам), Приоритет при исследовании кода (обязательный порядок)

### Community 6 - "AssetsProcessor"
Cohesion: 0.20
Nodes (9): AssetsProcessor, Injectable, AssetJobData, redisConnection(), escapeXml(), placeholderAsset(), toDataUrl(), truncate() (+1 more)

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+18 more)

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (27): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+19 more)

### Community 9 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, @foundry/shared-types, ioredis, @nestjs/common, @nestjs/config, @nestjs/core, @nestjs/platform-express, rxjs (+9 more)

### Community 10 - "api/package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 11 - "app/layout.tsx"
Cohesion: 0.08
Nodes (24): nextConfig, fraunces, inter, metadata, Providers(), ^build, coverage/**, .next/** (+16 more)

### Community 12 - "scripts"
Cohesion: 0.06
Nodes (30): devDependencies, prettier, turbo, typescript, vitest, @vitest/coverage-v8, engines, node (+22 more)

### Community 13 - "scenes.ts"
Cohesion: 0.26
Nodes (16): SceneInspector(), SceneListItem(), AssetPreview(), AssetPreviewProps, invalidateProject(), useAssetPolling(), useCreateScene(), useDeleteAsset() (+8 more)

### Community 14 - "storyboard-list-view.tsx"
Cohesion: 0.23
Nodes (12): ReadinessBadge(), SceneListItemProps, StoryboardListView(), StoryboardListViewProps, clampZoom(), STATUS_TONE, tickStep(), Timeline() (+4 more)

### Community 15 - "storyboard.ts"
Cohesion: 0.14
Nodes (15): Asset, Scene, sceneDurationSec(), countWords(), estimateSeconds(), extractJson(), ImportStoryboardDto, ImportStoryboardSchema (+7 more)

### Community 16 - "ExportService"
Cohesion: 0.15
Nodes (8): ExportController, Body, Controller, Param, Post, UseGuards, ExportService, Injectable

### Community 17 - "AssetsService"
Cohesion: 0.27
Nodes (4): AssetsQueue, Injectable, AssetsService, Injectable

### Community 18 - "shared-types/package.json"
Cohesion: 0.10
Nodes (19): dependencies, zod, devDependencies, typescript, exports, files, dist, typescript (+11 more)

### Community 19 - "app.module.ts"
Cohesion: 0.17
Nodes (14): AssetsModule, Module, ExportModule, Module, LlmModule, Module, ProjectsModule, Module (+6 more)

### Community 20 - "editor-workspace.tsx"
Cohesion: 0.06
Nodes (42): LibraryPage(), EditorPage(), EditorWorkspace(), EditorWorkspaceProps, ScriptView(), ScriptViewProps, ExportPanel(), ExportPanelProps (+34 more)

### Community 21 - "cn"
Cohesion: 0.15
Nodes (17): LeftRail(), Cover(), hashTone(), ProjectCard(), ProjectCardProps, AssetMedia(), AssetMediaProps, MediaPlayer() (+9 more)

### Community 22 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, lib, module, moduleResolution, noEmit, skipLibCheck (+5 more)

### Community 24 - "foundry_design_prompt.md"
Cohesion: 0.20
Nodes (9): COLOR — exact tokens, CORE SCREENS TO DESIGN (in this order), HARD BANS — DO NOT USE ANY OF THESE, LAYOUT PRINCIPLES, MOTION, OUTPUT FOR THIS PASS, ROLE, TECH STACK (+1 more)

### Community 25 - "foundry_development_prompt.md"
Cohesion: 0.22
Nodes (8): API DESIGN, DATA MODEL (Prisma) — exact shape, implement as-is unless something is clearly missing, FOLDER STRUCTURE, FRONTEND STATE, HARD BANS — DO NOT DO ANY OF THESE, MVP BUILD ORDER — build in this sequence, each step usable before moving on, ROLE, STACK (already decided, don't relitigate)

### Community 26 - "tsconfig.build.json"
Cohesion: 0.22
Nodes (8): compilerOptions, noEmit, outDir, rootDir, extends, include, src/**/*.ts, ./tsconfig.json

### Community 27 - "nest-cli.json"
Cohesion: 0.29
Nodes (6): collection, compilerOptions, deleteOutDir, webpack, $schema, sourceRoot

### Community 28 - "Foundry: полное описание проекта для нейросети"
Cohesion: 0.05
Nodes (40): 10. Авторизация и ownership, 11. Frontend-архитектура, 12. Backend-архитектура, 13. Технологический стек, 14. Основные переменные окружения, 15. Команды разработки, 16. Важные ограничения и незавершённые части, 17. Правила для нейросети, которая будет менять проект (+32 more)

### Community 29 - "llm.service.ts"
Cohesion: 0.15
Nodes (12): firstSentence(), GeminiResponseSchema, LlmScene, LlmSceneSchema, LlmScenesSchema, LlmService, localPrompts(), PROMPTS_PROMPT (+4 more)

### Community 30 - "Foundry"
Cohesion: 0.18
Nodes (10): Foundry, REST API, Дизайн-система, Команды, Локальный запуск, Переменные окружения, Поток данных, Стек (+2 more)

### Community 36 - "project.ts"
Cohesion: 0.18
Nodes (10): ProjectStatus, CreateProjectDto, CreateProjectSchema, hasDefaultTitle(), Project, ProjectListItem, ProjectListItemSchema, ProjectSchema (+2 more)

### Community 37 - "scene.ts"
Cohesion: 0.14
Nodes (14): AssetSchema, SceneStatus, activeAssetOf(), CreateSceneDto, CreateSceneSchema, ReorderScenesDto, ReorderScenesSchema, SCENE_ASSET_SLOTS (+6 more)

### Community 38 - "useEditor"
Cohesion: 0.14
Nodes (17): EditorChrome(), EditorChromeProps, PipelineStepper(), PipelineStepperProps, plan(), PlannedScene, PreviewPlayer(), PreviewPlayerProps (+9 more)

### Community 39 - "src/research.ts"
Cohesion: 0.29
Nodes (6): Research, ResearchSchema, Source, SourceSchema, UpsertResearchDto, UpsertResearchSchema

### Community 40 - "ResearchService"
Cohesion: 0.16
Nodes (10): ResearchController, Body, Controller, Get, Param, Put, UseGuards, parseSources() (+2 more)

### Community 42 - "PrismaService"
Cohesion: 0.36
Nodes (3): PrismaService, Injectable, WITH_ASSETS

### Community 43 - "Memory Maintenance"
Cohesion: 0.33
Nodes (5): Add/update threshold, Discovery Model, Maintenance Actions, Memory Maintenance, Style

### Community 52 - "ProjectsService"
Cohesion: 0.22
Nodes (5): ProjectsService, Injectable, parseStoryboard(), ScriptsService, Injectable

### Community 54 - "export.service.ts"
Cohesion: 0.25
Nodes (4): ExportResult, ProjectPayload, ScenePayload, ProjectPayload

### Community 55 - "inspector-panel.tsx"
Cohesion: 0.12
Nodes (19): ACCEPT_FOR, ASSET_KINDS, AssetKind, GENERATE_TOOLS, InspectorPanel(), InspectorPanelProps, kindOfTool(), OPEN_TOOLS (+11 more)

### Community 56 - "src/script.ts"
Cohesion: 0.33
Nodes (5): formatDuration(), Script, ScriptSchema, UpsertScriptDto, UpsertScriptSchema

### Community 57 - "5. Карта всех кнопок и элементов управления"
Cohesion: 0.17
Nodes (12): 5.11. Экспорт, 5.2. Верхняя панель редактора, 5.5. Редактор сценария, 5.8. Таймлайн, 5.9. Центральный холст Stage, 5. Карта всех кнопок и элементов управления, `Copy storyboard prompt`, `Export` (+4 more)

### Community 58 - "5.10. Инспектор выбранной сцены"
Cohesion: 0.18
Nodes (11): 5.10. Инспектор выбранной сцены, `Clip`, `Frame`, `Music`, `Voice`, Иконка корзины `Delete scene`, Карточка ассета, Поле `Image prompt` (+3 more)

### Community 60 - "5.4. Плавающая панель инструментов"
Cohesion: 0.29
Nodes (7): 5.4. Плавающая панель инструментов, `Clip`, `Frames`, `Music`, `Script`, `Storyboard`, `Voice`

### Community 61 - ".upload"
Cohesion: 0.08
Nodes (19): AppModule, Module, AssetsController, SceneAssetsController, Body, Controller, Delete, Get (+11 more)

### Community 62 - "5.1. Библиотека проектов"
Cohesion: 0.33
Nodes (6): 5.1. Библиотека проектов, `Cancel`, `Create`, `New project`, `Start a project`, Карточка проекта

### Community 63 - "5.3. Левая панель редактора"
Cohesion: 0.40
Nodes (5): 5.3. Левая панель редактора, `Assets`, `Library`, `Sources`, Нижняя иконка `Export`

### Community 64 - "5.7. Диалог Import storyboard"
Cohesion: 0.40
Nodes (5): 5.7. Диалог Import storyboard, `Cancel`, `Copy prompt`, `Import`, Поле JSON

### Community 65 - "5.6. Панель Storyboard"
Cohesion: 0.50
Nodes (4): 5.6. Панель Storyboard, `Add scene`, `Import storyboard`, `Split from script`

### Community 68 - "ProjectsController"
Cohesion: 0.14
Nodes (9): ProjectsController, Body, Controller, Delete, Get, Param, Patch, Post (+1 more)

### Community 69 - "use-scene-field.ts"
Cohesion: 0.17
Nodes (11): ProducingView(), ProducingViewProps, Stage(), StageProps, keyOf(), lastUndoPushAt, PendingWrite, pendingWrites (+3 more)

### Community 70 - "PrismaModule"
Cohesion: 0.67
Nodes (3): PrismaModule, Module, Global

## Knowledge Gaps
- **387 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `webpack` (+382 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sceneDurationSec()` connect `storyboard.ts` to `scene.ts`, `storyboard-list-view.tsx`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `Timeline()` connect `storyboard-list-view.tsx` to `cn`, `use-scene-field.ts`, `useEditor`, `storyboard.ts`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `AssetType` connect `.upload` to `enums.ts`, `scene.ts`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _387 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UserId` be split into smaller, more focused modules?**
  _Cohesion score 0.07242063492063493 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._