# Graph Report - Foundry-opus-5  (2026-07-31)

## Corpus Check
- 110 files · ~89,618 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 892 nodes · 1426 edges · 63 communities (53 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7346ea2b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UserId
- ScenesService
- enums.ts
- dependencies
- devDependencies
- Инструменты (MCP-серверы и хуки)
- AssetsProcessor
- compilerOptions
- compilerOptions
- dependencies
- app.module.ts
- app/layout.tsx
- scripts
- tabs.tsx
- inspector-panel.tsx
- storyboard.ts
- ExportService
- editor-workspace.tsx
- shared-types/package.json
- AssetsService
- editor-store.tsx
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
- ProjectsService
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
- upload.ts
- cn
- export.service.ts
- storyboard-list-view.tsx
- src/script.ts
- 5. Карта всех кнопок и элементов управления
- 5.10. Инспектор выбранной сцены
- 5.4. Плавающая панель инструментов
- 5.1. Библиотека проектов
- 5.3. Левая панель редактора
- 5.7. Диалог Import storyboard
- 5.6. Панель Storyboard

## God Nodes (most connected - your core abstractions)
1. `UserId` - 29 edges
2. `cn()` - 29 edges
3. `ProjectsService` - 23 edges
4. `compilerOptions` - 20 edges
5. `Foundry: полное описание проекта для нейросети` - 20 edges
6. `PrismaService` - 19 edges
7. `useEditor()` - 18 edges
8. `ScenesService` - 17 edges
9. `compilerOptions` - 16 edges
10. `ExportService` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Timeline()` --indirect_call--> `sceneDurationSec()`  [INFERRED]
  apps/web/src/components/editor/timeline.tsx → packages/shared-types/src/scene.ts
- `parseSources()` --references--> `SourceSchema`  [EXTRACTED]
  apps/api/src/research/research.service.ts → packages/shared-types/src/research.ts
- `parseStoryboard()` --references--> `StoryboardImportSchema`  [EXTRACTED]
  apps/api/src/scenes/scenes.service.ts → packages/shared-types/src/storyboard.ts
- `Field()` --calls--> `cn()`  [EXTRACTED]
  apps/web/src/components/editor/inspector-panel.tsx → apps/web/src/lib/utils.ts
- `EditorWorkspace()` --calls--> `useEditor()`  [EXTRACTED]
  apps/web/src/components/editor/editor-workspace.tsx → apps/web/src/lib/editor-store.tsx

## Import Cycles
- None detected.

## Communities (63 total, 10 thin omitted)

### Community 0 - "UserId"
Cohesion: 0.06
Nodes (30): AuthedRequest, AuthGuard, Injectable, UserId, Injectable, ZodValidationPipe, ProjectsController, Body (+22 more)

### Community 1 - "ScenesService"
Cohesion: 0.13
Nodes (12): ProjectScenesController, ScenesController, Body, Controller, Delete, Get, Param, Patch (+4 more)

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

### Community 6 - "AssetsProcessor"
Cohesion: 0.20
Nodes (9): AssetsProcessor, Injectable, AssetJobData, redisConnection(), escapeXml(), placeholderAsset(), toDataUrl(), truncate() (+1 more)

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+18 more)

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+18 more)

### Community 9 - "dependencies"
Cohesion: 0.08
Nodes (25): dependencies, bullmq, @foundry/shared-types, ioredis, multer, @nestjs/common, @nestjs/config, @nestjs/core (+17 more)

### Community 10 - "app.module.ts"
Cohesion: 0.20
Nodes (12): AssetsModule, Module, ExportModule, Module, ProjectsModule, Module, ResearchModule, Module (+4 more)

### Community 11 - "app/layout.tsx"
Cohesion: 0.08
Nodes (24): nextConfig, fraunces, inter, metadata, Providers(), ^build, coverage/**, .next/** (+16 more)

### Community 12 - "scripts"
Cohesion: 0.06
Nodes (30): devDependencies, prettier, turbo, typescript, vitest, @vitest/coverage-v8, engines, node (+22 more)

### Community 13 - "tabs.tsx"
Cohesion: 0.28
Nodes (8): Tabs(), TabsContent(), TabsContext, TabsContextValue, TabsList(), TabsProps, TabsTrigger(), useTabsContext()

### Community 14 - "inspector-panel.tsx"
Cohesion: 0.14
Nodes (25): ACCEPT_FOR, Field(), FieldProps, GENERATE_TOOLS, InspectorPanel(), InspectorPanelProps, OPEN_TOOLS, SceneInspector() (+17 more)

### Community 15 - "storyboard.ts"
Cohesion: 0.22
Nodes (7): ImportStoryboardDto, ImportStoryboardSchema, optionalText, StoryboardImport, StoryboardObjectSchema, StoryboardScene, StoryboardSceneSchema

### Community 16 - "ExportService"
Cohesion: 0.15
Nodes (8): ExportController, Body, Controller, Param, Post, UseGuards, ExportService, Injectable

### Community 17 - "editor-workspace.tsx"
Cohesion: 0.24
Nodes (14): EditorWorkspace(), EditorWorkspaceProps, ScriptView(), ScriptViewProps, ImportStoryboardDialog(), ImportStoryboardDialogProps, copyToClipboard(), copyWithFallback() (+6 more)

### Community 18 - "shared-types/package.json"
Cohesion: 0.10
Nodes (19): dependencies, zod, devDependencies, typescript, exports, files, dist, typescript (+11 more)

### Community 19 - "AssetsService"
Cohesion: 0.10
Nodes (16): AssetsController, SceneAssetsController, Body, Controller, Delete, Get, Param, Post (+8 more)

### Community 20 - "editor-store.tsx"
Cohesion: 0.16
Nodes (12): FloatingToolbar(), FloatingToolbarProps, EditorContext, EditorProvider(), EditorState, EditorStep, readStoredTheme(), Theme (+4 more)

### Community 22 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, lib, module, moduleResolution, noEmit, skipLibCheck (+5 more)

### Community 23 - "projects.ts"
Cohesion: 0.18
Nodes (6): api, ApiError, ProjectDetail, projectKeys, researchKeys, scriptKeys

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
Cohesion: 0.10
Nodes (25): LibraryPage(), EmptyLibrary(), EmptyLibraryProps, NewProjectRow(), NewProjectRowProps, Cover(), hashTone(), ProjectCard() (+17 more)

### Community 36 - "project.ts"
Cohesion: 0.22
Nodes (8): CreateProjectDto, CreateProjectSchema, Project, ProjectListItem, ProjectListItemSchema, ProjectSchema, UpdateProjectDto, UpdateProjectSchema

### Community 37 - "scene.ts"
Cohesion: 0.17
Nodes (10): CreateSceneDto, CreateSceneSchema, ReorderScenesDto, ReorderScenesSchema, Scene, SceneSchema, SetActiveAssetDto, SetActiveAssetSchema (+2 more)

### Community 38 - "asset.ts"
Cohesion: 0.29
Nodes (7): Asset, ASSET_PENDING_STATUSES, AssetSchema, CreateAssetDto, CreateAssetSchema, isAssetPending(), AssetStatus

### Community 39 - "src/research.ts"
Cohesion: 0.29
Nodes (6): Research, ResearchSchema, Source, SourceSchema, UpsertResearchDto, UpsertResearchSchema

### Community 40 - "ProjectsService"
Cohesion: 0.18
Nodes (7): ProjectsService, Injectable, parseSources(), ResearchService, Injectable, ScriptsService, Injectable

### Community 42 - "PrismaService"
Cohesion: 0.19
Nodes (7): PrismaModule, Module, PrismaService, Injectable, parseStoryboard(), WITH_ASSETS, Global

### Community 43 - "Memory Maintenance"
Cohesion: 0.33
Nodes (5): Add/update threshold, Discovery Model, Maintenance Actions, Memory Maintenance, Style

### Community 52 - "upload.ts"
Cohesion: 0.20
Nodes (7): AppModule, Module, ALLOWED, assertAllowedFile(), AUDIO_EXT, IMAGE_EXT, VIDEO_EXT

### Community 53 - "cn"
Cohesion: 0.26
Nodes (10): EditorPage(), EditorChrome(), EditorChromeProps, LeftRail(), ExportPanel(), ExportPanelProps, ExportResult, useEditor() (+2 more)

### Community 54 - "export.service.ts"
Cohesion: 0.50
Nodes (3): ExportResult, ProjectPayload, ScenePayload

### Community 55 - "storyboard-list-view.tsx"
Cohesion: 0.22
Nodes (12): SceneListItemProps, StoryboardListView(), StoryboardListViewProps, STATUS_TONE, tickStep(), Timeline(), TimelineProps, StatusDot() (+4 more)

### Community 56 - "src/script.ts"
Cohesion: 0.20
Nodes (12): hasDefaultTitle(), sceneDurationSec(), countWords(), estimateSeconds(), formatDuration(), Script, ScriptSchema, UpsertScriptDto (+4 more)

### Community 57 - "5. Карта всех кнопок и элементов управления"
Cohesion: 0.17
Nodes (12): 5.11. Экспорт, 5.2. Верхняя панель редактора, 5.5. Редактор сценария, 5.8. Таймлайн, 5.9. Центральный холст Stage, 5. Карта всех кнопок и элементов управления, `Copy storyboard prompt`, `Export` (+4 more)

### Community 58 - "5.10. Инспектор выбранной сцены"
Cohesion: 0.18
Nodes (11): 5.10. Инспектор выбранной сцены, `Clip`, `Frame`, `Music`, `Voice`, Иконка корзины `Delete scene`, Карточка ассета, Поле `Image prompt` (+3 more)

### Community 60 - "5.4. Плавающая панель инструментов"
Cohesion: 0.29
Nodes (7): 5.4. Плавающая панель инструментов, `Clip`, `Frames`, `Music`, `Script`, `Storyboard`, `Voice`

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
- **371 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `webpack` (+366 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sceneDurationSec()` connect `src/script.ts` to `scene.ts`, `storyboard-list-view.tsx`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Why does `Timeline()` connect `storyboard-list-view.tsx` to `src/script.ts`, `cn`, `inspector-panel.tsx`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Why does `AssetType` connect `AssetsService` to `enums.ts`, `scene.ts`, `asset.ts`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _371 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UserId` be split into smaller, more focused modules?**
  _Cohesion score 0.06291591046581972 - nodes in this community are weakly interconnected._
- **Should `ScenesService` be split into smaller, more focused modules?**
  _Cohesion score 0.12873563218390804 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._