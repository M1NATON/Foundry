# Graph Report - Foundry-opus-5  (2026-08-01)

## Corpus Check
- 133 files · ~106,610 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1070 nodes · 1901 edges · 69 communities (55 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eba9302d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- .assertOwned
- scripts
- asset.ts
- dependencies
- devDependencies
- Инструменты (MCP-серверы и хуки)
- useUploadAsset
- compilerOptions
- compilerOptions
- dependencies
- api/package.json
- app/layout.tsx
- scripts
- AssetsProcessor
- UserId
- ExportService
- ScriptsService
- shared-types/package.json
- app.module.ts
- useEditor
- compilerOptions
- scenes.ts
- foundry_design_prompt.md
- foundry_development_prompt.md
- tsconfig.build.json
- nest-cli.json
- Foundry: полное описание проекта для нейросети
- llm.service.ts
- Foundry
- next-env.d.ts
- tailwind.config.ts
- timeline.tsx
- scene.ts
- storyboard.ts
- ProjectsService
- Memory Maintenance
- api/core.md
- conventions.md
- memories/core.md
- shared_types/core.md
- suggested_commands.md
- task_completion.md
- tech_stack.md
- web/core.md
- @foundry/shared-types
- duration-drift.test.ts
- cn
- inspector-panel.tsx
- helpers.test.ts
- 5. Карта всех кнопок и элементов управления
- 5.10. Инспектор выбранной сцены
- multer
- 5.4. Плавающая панель инструментов
- project.ts
- 5.1. Библиотека проектов
- 5.3. Левая панель редактора
- 5.7. Диалог Import storyboard
- 5.6. Панель Storyboard
- @prisma/client
- reflect-metadata
- ProjectsController
- stage.tsx
- scenes.controller.ts
- music-track.tsx
- readiness-panel.tsx
- src/research.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 45 edges
2. `UserId` - 36 edges
3. `useEditor()` - 26 edges
4. `ProjectsService` - 24 edges
5. `ExportService` - 21 edges
6. `ScenesService` - 21 edges
7. `PrismaService` - 20 edges
8. `compilerOptions` - 20 edges
9. `Foundry: полное описание проекта для нейросети` - 20 edges
10. `AssetsService` - 19 edges

## Surprising Connections (you probably didn't know these)
- `ReadinessBadge()` --references--> `SCENE_ASSET_SLOTS`  [EXTRACTED]
  apps/web/src/components/editor/readiness-badge.tsx → packages/shared-types/src/scene.ts
- `parseSources()` --references--> `SourceSchema`  [EXTRACTED]
  apps/api/src/research/research.service.ts → packages/shared-types/src/research.ts
- `parseStoryboard()` --references--> `StoryboardImportSchema`  [EXTRACTED]
  apps/api/src/scenes/scenes.service.ts → packages/shared-types/src/storyboard.ts
- `ProjectMusicNote()` --calls--> `useProjectMusic()`  [EXTRACTED]
  apps/web/src/components/editor/readiness-panel.tsx → apps/web/src/lib/queries/music.ts
- `clip()` --calls--> `secondsToFrames()`  [EXTRACTED]
  apps/api/test/timeline.test.ts → apps/api/src/export/timeline.ts

## Import Cycles
- None detected.

## Communities (69 total, 14 thin omitted)

### Community 0 - ".assertOwned"
Cohesion: 0.07
Nodes (21): ResearchController, Body, Controller, Get, Param, Put, UseGuards, parseSources() (+13 more)

### Community 1 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, prisma:generate, prisma:migrate, start, test, typecheck

### Community 2 - "asset.ts"
Cohesion: 0.12
Nodes (18): ASSET_PENDING_STATUSES, AssetSchema, CreateAssetDto, CreateAssetSchema, GenerateMissingDto, GenerateMissingSchema, isAssetPending(), AssetStatus (+10 more)

### Community 3 - "dependencies"
Cohesion: 0.04
Nodes (45): dependencies, clsx, @foundry/shared-types, framer-motion, lucide-react, next, react, react-dom (+37 more)

### Community 4 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, @nestjs/cli, @nestjs/schematics, prisma, ts-node, tsconfig-paths, @types/express, @types/multer (+11 more)

### Community 5 - "Инструменты (MCP-серверы и хуки)"
Cohesion: 0.22
Nodes (8): context7 (MCP) — актуальная документация библиотек, graphify (MCP + хуки) — граф знаний кодовой базы, rtk (хук, если установлен) — сжатие вывода команд, Serena (MCP) — семантическая навигация по коду, Инструменты (MCP-серверы и хуки), Общие правила, Оркестрация задач (если CLI поддерживает делегирование подагентам), Приоритет при исследовании кода (обязательный порядок)

### Community 6 - "useUploadAsset"
Cohesion: 0.53
Nodes (4): useUploadAsset(), assetTypeOfFile(), TYPE_BY_EXT, useSceneDrop()

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+18 more)

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (27): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+19 more)

### Community 9 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, bullmq, ioredis, @nestjs/common, @nestjs/config, @nestjs/core, @nestjs/platform-express, rxjs (+9 more)

### Community 10 - "api/package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 11 - "app/layout.tsx"
Cohesion: 0.08
Nodes (24): nextConfig, fraunces, inter, metadata, Providers(), ^build, coverage/**, .next/** (+16 more)

### Community 12 - "scripts"
Cohesion: 0.06
Nodes (30): devDependencies, prettier, turbo, typescript, vitest, @vitest/coverage-v8, engines, node (+22 more)

### Community 13 - "AssetsProcessor"
Cohesion: 0.20
Nodes (9): AssetsProcessor, Injectable, AssetJobData, redisConnection(), escapeXml(), placeholderAsset(), toDataUrl(), truncate() (+1 more)

### Community 14 - "UserId"
Cohesion: 0.08
Nodes (31): AssetsController, ProjectAssetsController, ProjectMusicController, SceneAssetsController, Body, Controller, Delete, Get (+23 more)

### Community 16 - "ExportService"
Cohesion: 0.08
Nodes (24): ExportController, Body, Controller, Param, Post, UseGuards, ExportResult, ExportService (+16 more)

### Community 17 - "ScriptsService"
Cohesion: 0.15
Nodes (10): ScriptsController, Body, Controller, Get, Param, Post, Put, UseGuards (+2 more)

### Community 18 - "shared-types/package.json"
Cohesion: 0.10
Nodes (19): dependencies, zod, devDependencies, typescript, exports, files, dist, typescript (+11 more)

### Community 19 - "app.module.ts"
Cohesion: 0.14
Nodes (16): AppModule, Module, AssetsModule, Module, ExportModule, Module, LlmModule, Module (+8 more)

### Community 20 - "useEditor"
Cohesion: 0.05
Nodes (58): LibraryPage(), EditorPage(), EditorChrome(), EditorChromeProps, EditorWorkspace(), EditorWorkspaceProps, LeftRail(), PipelineStepper() (+50 more)

### Community 22 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, lib, module, moduleResolution, noEmit, skipLibCheck (+5 more)

### Community 23 - "scenes.ts"
Cohesion: 0.28
Nodes (13): SceneListItem(), SceneListItemProps, StoryboardListViewProps, AssetPreview(), AssetPreviewProps, invalidateProject(), useAssetPolling(), useCreateScene() (+5 more)

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

### Community 36 - "timeline.tsx"
Cohesion: 0.20
Nodes (12): ReadinessBadge(), StoryboardListView(), clampZoom(), SceneCard, SceneCardProps, STATUS_TONE, tickStep(), Timeline() (+4 more)

### Community 37 - "scene.ts"
Cohesion: 0.13
Nodes (16): activeAssetOf(), CreateSceneDto, CreateSceneSchema, GAP_LABEL, hasMusicOverride(), musicForScene(), ProjectGap, ReorderScenesDto (+8 more)

### Community 39 - "storyboard.ts"
Cohesion: 0.14
Nodes (15): parseStoryboard(), buildScriptFromTopicPrompt(), extractJson(), ImportStoryboardDto, ImportStoryboardSchema, optionalText, SCRIPT_LENGTH_PRESETS, scriptFromScenes() (+7 more)

### Community 42 - "ProjectsService"
Cohesion: 0.18
Nodes (10): PrismaModule, Module, PrismaService, Injectable, ProjectsService, Injectable, ResearchService, Injectable (+2 more)

### Community 43 - "Memory Maintenance"
Cohesion: 0.33
Nodes (5): Add/update threshold, Discovery Model, Maintenance Actions, Memory Maintenance, Style

### Community 53 - "duration-drift.test.ts"
Cohesion: 0.21
Nodes (10): Asset, assetDurationDrift(), hasDurationMismatch(), projectGaps(), Scene, sceneDuration(), sceneDurationSec(), asset() (+2 more)

### Community 54 - "cn"
Cohesion: 0.12
Nodes (23): SceneTextarea(), TakeChip(), ExportPanel(), ExportPanelProps, ExportResult, GROUPS, Cover(), hashTone() (+15 more)

### Community 55 - "inspector-panel.tsx"
Cohesion: 0.12
Nodes (22): ACCEPT_FOR, ASSET_KINDS, AssetKind, GENERATE_TOOLS, InspectorPanel(), InspectorPanelProps, kindOfTool(), OPEN_TOOLS (+14 more)

### Community 56 - "helpers.test.ts"
Cohesion: 0.15
Nodes (15): hasDefaultTitle(), SCENE_ASSET_SLOTS, countSpokenWords(), countWords(), estimateSeconds(), estimateSpeechSeconds(), formatDuration(), formatSceneDuration() (+7 more)

### Community 57 - "5. Карта всех кнопок и элементов управления"
Cohesion: 0.17
Nodes (12): 5.11. Экспорт, 5.2. Верхняя панель редактора, 5.5. Редактор сценария, 5.8. Таймлайн, 5.9. Центральный холст Stage, 5. Карта всех кнопок и элементов управления, `Copy storyboard prompt`, `Export` (+4 more)

### Community 58 - "5.10. Инспектор выбранной сцены"
Cohesion: 0.18
Nodes (11): 5.10. Инспектор выбранной сцены, `Clip`, `Frame`, `Music`, `Voice`, Иконка корзины `Delete scene`, Карточка ассета, Поле `Image prompt` (+3 more)

### Community 60 - "5.4. Плавающая панель инструментов"
Cohesion: 0.29
Nodes (7): 5.4. Плавающая панель инструментов, `Clip`, `Frames`, `Music`, `Script`, `Storyboard`, `Voice`

### Community 61 - "project.ts"
Cohesion: 0.13
Nodes (12): CreateProjectDto, CreateProjectSchema, Project, ProjectListItem, ProjectListItemSchema, ProjectMusic, ProjectMusicSchema, ProjectSchema (+4 more)

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
Cohesion: 0.13
Nodes (9): ProjectsController, Body, Controller, Delete, Get, Param, Patch, Post (+1 more)

### Community 69 - "stage.tsx"
Cohesion: 0.13
Nodes (16): readyTrack(), Stage(), StageProps, withUrl(), AssetMedia(), AssetMediaProps, MediaPlayer(), MediaPlayerProps (+8 more)

### Community 72 - "scenes.controller.ts"
Cohesion: 0.29
Nodes (5): AuthedRequest, AuthGuard, Injectable, Injectable, ZodValidationPipe

### Community 73 - "music-track.tsx"
Cohesion: 0.32
Nodes (12): BarProps, LaneProps, MusicBar(), MusicLane(), SceneMusicOverride(), invalidateMusic(), musicKeys, useDeleteProjectMusic() (+4 more)

### Community 76 - "readiness-panel.tsx"
Cohesion: 0.13
Nodes (16): BATCH, FillTheGaps(), ProjectMusicNote(), ReadinessPanel(), ReadinessPanelProps, EmptyLibraryProps, NewProjectRow(), NewProjectRowProps (+8 more)

### Community 78 - "src/research.ts"
Cohesion: 0.33
Nodes (5): Research, ResearchSchema, Source, UpsertResearchDto, UpsertResearchSchema

## Knowledge Gaps
- **411 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `webpack` (+406 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SCENE_ASSET_SLOTS` connect `helpers.test.ts` to `timeline.tsx`, `scene.ts`?**
  _High betweenness centrality (0.188) - this node is a cross-community bridge._
- **Why does `ReadinessBadge()` connect `timeline.tsx` to `helpers.test.ts`, `cn`, `scenes.ts`?**
  _High betweenness centrality (0.186) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `timeline.tsx`, `stage.tsx`, `music-track.tsx`, `readiness-panel.tsx`, `useEditor`, `scenes.ts`, `inspector-panel.tsx`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _411 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `.assertOwned` be split into smaller, more focused modules?**
  _Cohesion score 0.07205387205387205 - nodes in this community are weakly interconnected._
- **Should `asset.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._