# Graph Report - Foundry-opus-5  (2026-07-28)

## Corpus Check
- 92 files · ~50,926 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 738 nodes · 1190 edges · 42 communities (40 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- UserId
- ProjectsService
- enums.ts
- dependencies
- devDependencies
- Инструменты (MCP-серверы и хуки)
- ScenesService
- compilerOptions
- compilerOptions
- dependencies
- AssetsService
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
- timeline.tsx
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

## God Nodes (most connected - your core abstractions)
1. `UserId` - 28 edges
2. `cn()` - 24 edges
3. `ProjectsService` - 23 edges
4. `compilerOptions` - 20 edges
5. `PrismaService` - 19 edges
6. `ScenesService` - 16 edges
7. `compilerOptions` - 16 edges
8. `ExportService` - 14 edges
9. `scripts` - 13 edges
10. `AssetsService` - 12 edges

## Surprising Connections (you probably didn't know these)
- `parseSources()` --references--> `SourceSchema`  [EXTRACTED]
  apps/api/src/research/research.service.ts → packages/shared-types/src/research.ts
- `parseStoryboard()` --references--> `StoryboardImportSchema`  [EXTRACTED]
  apps/api/src/scenes/scenes.service.ts → packages/shared-types/src/storyboard.ts
- `FloatingToolbarProps` --references--> `EditorTool`  [EXTRACTED]
  apps/web/src/components/editor/floating-toolbar.tsx → apps/web/src/lib/editor-store.tsx
- `FloatingToolbar()` --calls--> `cn()`  [EXTRACTED]
  apps/web/src/components/editor/floating-toolbar.tsx → apps/web/src/lib/utils.ts
- `InspectorPanelProps` --references--> `EditorTool`  [EXTRACTED]
  apps/web/src/components/editor/inspector-panel.tsx → apps/web/src/lib/editor-store.tsx

## Import Cycles
- None detected.

## Communities (42 total, 2 thin omitted)

### Community 0 - "UserId"
Cohesion: 0.06
Nodes (35): ALLOWED, assertAllowedFile(), AUDIO_EXT, IMAGE_EXT, VIDEO_EXT, AuthedRequest, AuthGuard, Injectable (+27 more)

### Community 1 - "ProjectsService"
Cohesion: 0.06
Nodes (33): AppModule, Module, AssetsModule, Module, AssetsQueue, Injectable, ExportModule, Module (+25 more)

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

### Community 6 - "ScenesService"
Cohesion: 0.13
Nodes (12): ProjectScenesController, ScenesController, Body, Controller, Delete, Get, Param, Patch (+4 more)

### Community 7 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+18 more)

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+18 more)

### Community 9 - "dependencies"
Cohesion: 0.08
Nodes (25): dependencies, bullmq, @foundry/shared-types, ioredis, multer, @nestjs/common, @nestjs/config, @nestjs/core (+17 more)

### Community 10 - "AssetsService"
Cohesion: 0.12
Nodes (14): AssetsController, SceneAssetsController, Body, Controller, Delete, Get, Param, Post (+6 more)

### Community 11 - "app/layout.tsx"
Cohesion: 0.08
Nodes (24): nextConfig, fraunces, inter, metadata, Providers(), ^build, coverage/**, .next/** (+16 more)

### Community 12 - "scripts"
Cohesion: 0.06
Nodes (30): devDependencies, prettier, turbo, typescript, vitest, @vitest/coverage-v8, engines, node (+22 more)

### Community 13 - "cn"
Cohesion: 0.18
Nodes (14): EditorChrome(), EditorChromeProps, Field(), ExportPanel(), ExportPanelProps, ExportResult, Cover(), hashTone() (+6 more)

### Community 14 - "inspector-panel.tsx"
Cohesion: 0.21
Nodes (18): FieldProps, GENERATE_TOOLS, InspectorPanel(), OPEN_TOOLS, SceneInspector(), StoryboardBody(), AssetPreview(), AssetPreviewProps (+10 more)

### Community 15 - "storyboard.ts"
Cohesion: 0.17
Nodes (13): hasDefaultTitle(), countWords(), estimateSeconds(), extractJson(), ImportStoryboardDto, ImportStoryboardSchema, optionalText, sceneSeconds() (+5 more)

### Community 16 - "ExportService"
Cohesion: 0.15
Nodes (8): ExportController, Body, Controller, Param, Post, UseGuards, ExportService, Injectable

### Community 17 - "import-storyboard-dialog.tsx"
Cohesion: 0.15
Nodes (12): NewProjectRow(), NewProjectRowProps, ImportStoryboardDialog(), ImportStoryboardDialogProps, Button, ButtonProps, Size, SIZES (+4 more)

### Community 18 - "shared-types/package.json"
Cohesion: 0.10
Nodes (19): dependencies, zod, devDependencies, typescript, exports, files, dist, typescript (+11 more)

### Community 19 - "AssetsProcessor"
Cohesion: 0.20
Nodes (9): AssetsProcessor, Injectable, AssetJobData, redisConnection(), escapeXml(), placeholderAsset(), toDataUrl(), truncate() (+1 more)

### Community 20 - "editor-store.tsx"
Cohesion: 0.21
Nodes (8): FloatingToolbar(), FloatingToolbarProps, TOOLS, InspectorPanelProps, EditorContext, EditorProvider(), EditorState, EditorTool

### Community 21 - "editor/page.tsx"
Cohesion: 0.27
Nodes (11): EditorPage(), LeftRail(), LeftRailProps, ScriptOverlay(), ScriptOverlayProps, useEditor(), useProject(), useScenes() (+3 more)

### Community 22 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, lib, module, moduleResolution, noEmit, skipLibCheck (+5 more)

### Community 23 - "projects.ts"
Cohesion: 0.18
Nodes (7): LibraryPage(), api, ProjectDetail, projectKeys, useCreateProject(), useProjects(), researchKeys

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

### Community 28 - "timeline.tsx"
Cohesion: 0.43
Nodes (6): sceneDuration(), STATUS_TONE, tickStep(), Timeline(), TimelineProps, useReorderScenes()

### Community 29 - "llm.service.ts"
Cohesion: 0.19
Nodes (10): LlmModule, Module, firstSentence(), GeminiResponseSchema, LlmScene, LlmSceneSchema, LlmScenesSchema, LlmService (+2 more)

### Community 30 - "Foundry"
Cohesion: 0.18
Nodes (10): Commands, Data Flow, Design Constraints, Environment, Foundry, Local Setup, Requirements, REST API (+2 more)

### Community 35 - "primitives.tsx"
Cohesion: 0.19
Nodes (10): Stage(), StageProps, EmptyLibrary(), EmptyLibraryProps, DOT_TONE, ProgressProps, RISE, SPRING (+2 more)

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

## Knowledge Gaps
- **279 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `webpack` (+274 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserId` connect `UserId` to `ExportService`, `AssetsService`, `ScenesService`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `AssetType` connect `AssetsService` to `enums.ts`, `asset.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `parseStoryboard()` connect `ProjectsService` to `storyboard.ts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _279 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UserId` be split into smaller, more focused modules?**
  _Cohesion score 0.05505952380952381 - nodes in this community are weakly interconnected._
- **Should `ProjectsService` be split into smaller, more focused modules?**
  _Cohesion score 0.05926251097453907 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._