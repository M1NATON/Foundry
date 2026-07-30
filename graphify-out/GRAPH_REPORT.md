# Graph Report - Foundry-opus-5  (2026-07-30)

## Corpus Check
- 104 files · ~71,584 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 866 nodes · 1327 edges · 66 communities (56 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- UserId
- ProjectsService
- enums.ts
- dependencies
- devDependencies
- Инструменты (MCP-серверы и хуки)
- app.module.ts
- compilerOptions
- compilerOptions
- dependencies
- .upload
- app/layout.tsx
- scripts
- cn
- inspector-panel.tsx
- storyboard.ts
- ExportService
- import-storyboard-dialog.tsx
- shared-types/package.json
- AssetsProcessor
- editor-store.tsx
- editor/page.tsx
- compilerOptions
- projects.ts
- foundry_design_prompt.md
- foundry_development_prompt.md
- tsconfig.build.json
- nest-cli.json
- Foundry: полное описание проекта для нейросети
- llm.service.ts
- Foundry
- next-env.d.ts
- tailwind.config.ts
- primitives.tsx
- project.ts
- scene.ts
- asset.ts
- src/research.ts
- src/script.ts
- ResearchController
- Memory Maintenance
- api/core.md
- conventions.md
- memories/core.md
- shared_types/core.md
- suggested_commands.md
- task_completion.md
- tech_stack.md
- web/core.md
- ProjectsController
- assets.controller.ts
- .assertOwned
- ScenesService
- ScriptsController
- 5. Карта всех кнопок и элементов управления
- 5.10. Инспектор выбранной сцены
- AssetsService
- 5.4. Плавающая панель инструментов
- upload.ts
- 5.1. Библиотека проектов
- 5.3. Левая панель редактора
- 5.7. Диалог Import storyboard
- 5.6. Панель Storyboard

## God Nodes (most connected - your core abstractions)
1. `UserId` - 28 edges
2. `cn()` - 27 edges
3. `ProjectsService` - 23 edges
4. `compilerOptions` - 20 edges
5. `Foundry: полное описание проекта для нейросети` - 20 edges
6. `PrismaService` - 19 edges
7. `ScenesService` - 16 edges
8. `compilerOptions` - 16 edges
9. `ExportService` - 14 edges
10. `scripts` - 13 edges

## Surprising Connections (you probably didn't know these)
- `parseSources()` --references--> `SourceSchema`  [EXTRACTED]
  apps/api/src/research/research.service.ts → packages/shared-types/src/research.ts
- `parseStoryboard()` --references--> `StoryboardImportSchema`  [EXTRACTED]
  apps/api/src/scenes/scenes.service.ts → packages/shared-types/src/storyboard.ts
- `EditorPage()` --calls--> `useScript()`  [EXTRACTED]
  apps/web/src/app/projects/[id]/editor/page.tsx → apps/web/src/lib/queries/script.ts
- `EditorChrome()` --calls--> `cn()`  [EXTRACTED]
  apps/web/src/components/editor/editor-chrome.tsx → apps/web/src/lib/utils.ts
- `FloatingToolbarProps` --references--> `EditorTool`  [EXTRACTED]
  apps/web/src/components/editor/floating-toolbar.tsx → apps/web/src/lib/editor-store.tsx

## Import Cycles
- None detected.

## Communities (66 total, 10 thin omitted)

### Community 0 - "UserId"
Cohesion: 0.19
Nodes (11): UserId, ProjectScenesController, ScenesController, Body, Controller, Delete, Get, Param (+3 more)

### Community 1 - "ProjectsService"
Cohesion: 0.21
Nodes (7): PrismaService, Injectable, ProjectsService, Injectable, ResearchService, Injectable, WITH_ASSETS

### Community 2 - "enums.ts"
Cohesion: 0.21
Nodes (9): ExportFormat, PIPELINE_STAGES, PROJECT_STATUS_LABEL, projectProgress(), ProjectStatus, SceneStatus, EXPORT_FORMATS, ExportRequestDto (+1 more)

### Community 3 - "dependencies"
Cohesion: 0.04
Nodes (45): dependencies, clsx, @foundry/shared-types, framer-motion, lucide-react, next, react, react-dom (+37 more)

### Community 4 - "devDependencies"
Cohesion: 0.06
Nodes (30): devDependencies, @nestjs/cli, @nestjs/schematics, prisma, ts-node, tsconfig-paths, @types/express, @types/multer (+22 more)

### Community 5 - "Инструменты (MCP-серверы и хуки)"
Cohesion: 0.22
Nodes (8): context7 (MCP) — актуальная документация библиотек, graphify (MCP + хуки) — граф знаний кодовой базы, rtk (хук, если установлен) — сжатие вывода команд, Serena (MCP) — семантическая навигация по коду, Инструменты (MCP-серверы и хуки), Общие правила, Оркестрация задач (если CLI поддерживает делегирование подагентам), Приоритет при исследовании кода (обязательный порядок)

### Community 6 - "app.module.ts"
Cohesion: 0.13
Nodes (17): AppModule, Module, AssetsModule, Module, ExportModule, Module, PrismaModule, Module (+9 more)

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+18 more)

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+18 more)

### Community 9 - "dependencies"
Cohesion: 0.08
Nodes (25): dependencies, bullmq, @foundry/shared-types, ioredis, multer, @nestjs/common, @nestjs/config, @nestjs/core (+17 more)

### Community 10 - ".upload"
Cohesion: 0.13
Nodes (12): AssetsController, SceneAssetsController, Body, Controller, Delete, Get, Param, Post (+4 more)

### Community 11 - "app/layout.tsx"
Cohesion: 0.08
Nodes (24): nextConfig, fraunces, inter, metadata, Providers(), ^build, coverage/**, .next/** (+16 more)

### Community 12 - "scripts"
Cohesion: 0.06
Nodes (30): devDependencies, prettier, turbo, typescript, vitest, @vitest/coverage-v8, engines, node (+22 more)

### Community 13 - "cn"
Cohesion: 0.16
Nodes (17): Field(), Cover(), hashTone(), ProjectCard(), ProjectCardProps, Progress(), staggerDelay(), Tabs() (+9 more)

### Community 14 - "inspector-panel.tsx"
Cohesion: 0.18
Nodes (20): ACCEPT_FOR, FieldProps, GENERATE_TOOLS, InspectorPanel(), OPEN_TOOLS, SceneInspector(), StoryboardBody(), AssetPreview() (+12 more)

### Community 15 - "storyboard.ts"
Cohesion: 0.17
Nodes (13): hasDefaultTitle(), countWords(), estimateSeconds(), extractJson(), ImportStoryboardDto, ImportStoryboardSchema, optionalText, sceneSeconds() (+5 more)

### Community 16 - "ExportService"
Cohesion: 0.12
Nodes (11): ExportController, Body, Controller, Param, Post, UseGuards, ExportResult, ExportService (+3 more)

### Community 17 - "import-storyboard-dialog.tsx"
Cohesion: 0.24
Nodes (10): ScriptOverlay(), ScriptOverlayProps, ImportStoryboardDialog(), ImportStoryboardDialogProps, ApiError, copyToClipboard(), copyWithFallback(), useImportStoryboard() (+2 more)

### Community 18 - "shared-types/package.json"
Cohesion: 0.10
Nodes (19): dependencies, zod, devDependencies, typescript, exports, files, dist, typescript (+11 more)

### Community 19 - "AssetsProcessor"
Cohesion: 0.20
Nodes (9): AssetsProcessor, Injectable, AssetJobData, redisConnection(), escapeXml(), placeholderAsset(), toDataUrl(), truncate() (+1 more)

### Community 20 - "editor-store.tsx"
Cohesion: 0.19
Nodes (10): FloatingToolbar(), FloatingToolbarProps, TOOLS, InspectorPanelProps, EditorContext, EditorProvider(), EditorState, EditorTool (+2 more)

### Community 21 - "editor/page.tsx"
Cohesion: 0.21
Nodes (14): EditorPage(), EditorChrome(), EditorChromeProps, LeftRail(), LeftRailProps, sceneDuration(), STATUS_TONE, tickStep() (+6 more)

### Community 22 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, lib, module, moduleResolution, noEmit, skipLibCheck (+5 more)

### Community 23 - "projects.ts"
Cohesion: 0.16
Nodes (8): ExportPanel(), ExportPanelProps, ExportResult, api, ProjectDetail, projectKeys, researchKeys, scriptKeys

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
Cohesion: 0.19
Nodes (10): LlmModule, Module, firstSentence(), GeminiResponseSchema, LlmScene, LlmSceneSchema, LlmScenesSchema, LlmService (+2 more)

### Community 30 - "Foundry"
Cohesion: 0.18
Nodes (10): Foundry, REST API, Дизайн-система, Команды, Локальный запуск, Переменные окружения, Поток данных, Стек (+2 more)

### Community 35 - "primitives.tsx"
Cohesion: 0.11
Nodes (20): LibraryPage(), Stage(), StageProps, EmptyLibrary(), EmptyLibraryProps, NewProjectRow(), NewProjectRowProps, Button (+12 more)

### Community 36 - "project.ts"
Cohesion: 0.22
Nodes (8): CreateProjectDto, CreateProjectSchema, Project, ProjectListItem, ProjectListItemSchema, ProjectSchema, UpdateProjectDto, UpdateProjectSchema

### Community 37 - "scene.ts"
Cohesion: 0.22
Nodes (8): CreateSceneDto, CreateSceneSchema, ReorderScenesDto, ReorderScenesSchema, Scene, SceneSchema, UpdateSceneDto, UpdateSceneSchema

### Community 38 - "asset.ts"
Cohesion: 0.29
Nodes (7): Asset, ASSET_PENDING_STATUSES, AssetSchema, CreateAssetDto, CreateAssetSchema, isAssetPending(), AssetStatus

### Community 39 - "src/research.ts"
Cohesion: 0.29
Nodes (6): Research, ResearchSchema, Source, SourceSchema, UpsertResearchDto, UpsertResearchSchema

### Community 40 - "src/script.ts"
Cohesion: 0.33
Nodes (5): formatDuration(), Script, ScriptSchema, UpsertScriptDto, UpsertScriptSchema

### Community 42 - "ResearchController"
Cohesion: 0.22
Nodes (7): ResearchController, Body, Controller, Get, Param, Put, UseGuards

### Community 43 - "Memory Maintenance"
Cohesion: 0.33
Nodes (5): Add/update threshold, Discovery Model, Maintenance Actions, Memory Maintenance, Style

### Community 52 - "ProjectsController"
Cohesion: 0.14
Nodes (9): ProjectsController, Body, Controller, Delete, Get, Param, Patch, Post (+1 more)

### Community 53 - "assets.controller.ts"
Cohesion: 0.29
Nodes (5): AuthedRequest, AuthGuard, Injectable, Injectable, ZodValidationPipe

### Community 54 - ".assertOwned"
Cohesion: 0.26
Nodes (3): parseSources(), ScriptsService, Injectable

### Community 55 - "ScenesService"
Cohesion: 0.26
Nodes (3): parseStoryboard(), ScenesService, Injectable

### Community 56 - "ScriptsController"
Cohesion: 0.20
Nodes (8): ScriptsController, Body, Controller, Get, Param, Post, Put, UseGuards

### Community 57 - "5. Карта всех кнопок и элементов управления"
Cohesion: 0.17
Nodes (12): 5.11. Экспорт, 5.2. Верхняя панель редактора, 5.5. Редактор сценария, 5.8. Таймлайн, 5.9. Центральный холст Stage, 5. Карта всех кнопок и элементов управления, `Copy storyboard prompt`, `Export` (+4 more)

### Community 58 - "5.10. Инспектор выбранной сцены"
Cohesion: 0.18
Nodes (11): 5.10. Инспектор выбранной сцены, `Clip`, `Frame`, `Music`, `Voice`, Иконка корзины `Delete scene`, Карточка ассета, Поле `Image prompt` (+3 more)

### Community 59 - "AssetsService"
Cohesion: 0.27
Nodes (4): AssetsQueue, Injectable, AssetsService, Injectable

### Community 60 - "5.4. Плавающая панель инструментов"
Cohesion: 0.29
Nodes (7): 5.4. Плавающая панель инструментов, `Clip`, `Frames`, `Music`, `Script`, `Storyboard`, `Voice`

### Community 61 - "upload.ts"
Cohesion: 0.33
Nodes (5): ALLOWED, assertAllowedFile(), AUDIO_EXT, IMAGE_EXT, VIDEO_EXT

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

## Knowledge Gaps
- **369 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `webpack` (+364 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserId` connect `UserId` to `.upload`, `ResearchController`, `ExportService`, `ProjectsController`, `assets.controller.ts`, `ScriptsController`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `AssetType` connect `.upload` to `enums.ts`, `asset.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `parseStoryboard()` connect `ScenesService` to `ProjectsService`, `storyboard.ts`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _369 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `app.module.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12923076923076923 - nodes in this community are weakly interconnected._