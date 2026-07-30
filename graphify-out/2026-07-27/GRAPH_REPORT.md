# Graph Report - Foundry-opus-5  (2026-07-27)

## Corpus Check
- 87 files · ~18,251 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 699 nodes · 1119 edges · 35 communities (33 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- ProjectsService
- UserId
- enums.ts
- project-card.tsx
- devDependencies
- compilerOptions
- compilerOptions
- devDependencies
- scripts
- dependencies
- dependencies
- shared-types/package.json
- tasks
- compilerOptions
- projects.ts
- ResearchController
- foundry_design_prompt.md
- app.module.ts
- Инструменты (MCP-серверы и хуки)
- foundry_development_prompt.md
- tsconfig.build.json
- script.ts
- nest-cli.json
- research.ts
- tailwind.config.ts
- scene-card.tsx
- ExportService
- research/page.tsx
- AssetsProcessor
- button.tsx
- ScriptsController
- Foundry
- next-env.d.ts

## God Nodes (most connected - your core abstractions)
1. `UserId` - 27 edges
2. `ProjectsService` - 23 edges
3. `cn()` - 22 edges
4. `compilerOptions` - 20 edges
5. `PrismaService` - 19 edges
6. `ScenesService` - 16 edges
7. `compilerOptions` - 16 edges
8. `ExportService` - 14 edges
9. `SPRING` - 12 edges
10. `AssetsProcessor` - 10 edges

## Surprising Connections (you probably didn't know these)
- `parseSources()` --references--> `SourceSchema`  [EXTRACTED]
  apps/api/src/research/research.service.ts → packages/shared-types/src/research.ts
- `parseStoryboard()` --references--> `StoryboardImportSchema`  [EXTRACTED]
  apps/api/src/scenes/scenes.service.ts → packages/shared-types/src/storyboard.ts
- `Field()` --calls--> `cn()`  [EXTRACTED]
  apps/web/src/components/editor/inspector-panel.tsx → apps/web/src/lib/utils.ts
- `bootstrap()` --indirect_call--> `AppModule`  [INFERRED]
  apps/api/src/main.ts → apps/api/src/app.module.ts
- `EditorPage()` --calls--> `useScript()`  [EXTRACTED]
  apps/web/src/app/projects/[id]/editor/page.tsx → apps/web/src/lib/queries/script.ts

## Import Cycles
- None detected.

## Communities (35 total, 2 thin omitted)

### Community 0 - "ProjectsService"
Cohesion: 0.06
Nodes (38): AppModule, Module, ExportModule, Module, ExportResult, ProjectPayload, ScenePayload, LlmModule (+30 more)

### Community 1 - "UserId"
Cohesion: 0.08
Nodes (23): AuthedRequest, AuthGuard, Injectable, UserId, Injectable, ZodValidationPipe, ProjectsController, Body (+15 more)

### Community 2 - "enums.ts"
Cohesion: 0.07
Nodes (33): Asset, ASSET_PENDING_STATUSES, AssetSchema, CreateAssetDto, CreateAssetSchema, isAssetPending(), AssetStatus, AssetType (+25 more)

### Community 3 - "project-card.tsx"
Cohesion: 0.18
Nodes (14): EditorChrome(), EditorChromeProps, LeftRail(), LeftRailProps, ExportPanel(), ExportPanelProps, ExportResult, Cover() (+6 more)

### Community 4 - "devDependencies"
Cohesion: 0.07
Nodes (27): devDependencies, @nestjs/cli, @nestjs/schematics, prisma, ts-node, tsconfig-paths, @types/express, @types/node (+19 more)

### Community 5 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+18 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+18 more)

### Community 7 - "devDependencies"
Cohesion: 0.04
Nodes (44): dependencies, clsx, @foundry/shared-types, framer-motion, lucide-react, next, react, react-dom (+36 more)

### Community 8 - "scripts"
Cohesion: 0.08
Nodes (23): devDependencies, prettier, turbo, typescript, engines, node, turbo, typescript (+15 more)

### Community 9 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, bullmq, @foundry/shared-types, ioredis, @nestjs/common, @nestjs/config, @nestjs/core, @nestjs/platform-express (+15 more)

### Community 10 - "dependencies"
Cohesion: 0.11
Nodes (12): ProjectScenesController, ScenesController, Body, Controller, Delete, Get, Param, Patch (+4 more)

### Community 11 - "shared-types/package.json"
Cohesion: 0.11
Nodes (18): dependencies, zod, devDependencies, typescript, exports, files, dist, typescript (+10 more)

### Community 12 - "tasks"
Cohesion: 0.09
Nodes (20): nextConfig, fraunces, inter, metadata, Providers(), ^build, .next/**, !.next/cache/** (+12 more)

### Community 13 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, declaration, esModuleInterop, lib, module, moduleResolution, noEmit, skipLibCheck (+5 more)

### Community 14 - "projects.ts"
Cohesion: 0.18
Nodes (7): LibraryPage(), api, ProjectDetail, projectKeys, useCreateProject(), useProjects(), researchKeys

### Community 15 - "ResearchController"
Cohesion: 0.11
Nodes (14): ResearchController, Body, Controller, Get, Param, Put, UseGuards, parseSources() (+6 more)

### Community 16 - "foundry_design_prompt.md"
Cohesion: 0.20
Nodes (9): COLOR — exact tokens, CORE SCREENS TO DESIGN (in this order), HARD BANS — DO NOT USE ANY OF THESE, LAYOUT PRINCIPLES, MOTION, OUTPUT FOR THIS PASS, ROLE, TECH STACK (+1 more)

### Community 17 - "app.module.ts"
Cohesion: 0.18
Nodes (11): Stage(), StageProps, EmptyLibrary(), EmptyLibraryProps, AssetPreviewProps, DOT_TONE, ProgressProps, RISE (+3 more)

### Community 18 - "Инструменты (MCP-серверы и хуки)"
Cohesion: 0.22
Nodes (8): context7 (MCP) — актуальная документация библиотек, graphify, graphify (MCP + хуки) — граф знаний кодовой базы, Orchestration workflow, rtk (хук) — сжатие вывода команд, Rules, Serena (MCP) — семантическая навигация по коду, Инструменты (MCP-серверы и хуки)

### Community 19 - "foundry_development_prompt.md"
Cohesion: 0.22
Nodes (8): API DESIGN, DATA MODEL (Prisma) — exact shape, implement as-is unless something is clearly missing, FOLDER STRUCTURE, FRONTEND STATE, HARD BANS — DO NOT DO ANY OF THESE, MVP BUILD ORDER — build in this sequence, each step usable before moving on, ROLE, STACK (already decided, don't relitigate)

### Community 20 - "tsconfig.build.json"
Cohesion: 0.22
Nodes (8): compilerOptions, noEmit, outDir, rootDir, extends, include, src/**/*.ts, ./tsconfig.json

### Community 21 - "script.ts"
Cohesion: 0.11
Nodes (16): parseStoryboard(), countWords(), estimateSeconds(), Script, ScriptSchema, UpsertScriptDto, UpsertScriptSchema, ImportStoryboardDto (+8 more)

### Community 22 - "nest-cli.json"
Cohesion: 0.29
Nodes (6): collection, compilerOptions, deleteOutDir, webpack, $schema, sourceRoot

### Community 23 - "research.ts"
Cohesion: 0.30
Nodes (10): EditorPage(), sceneDuration(), STATUS_TONE, tickStep(), Timeline(), TimelineProps, staggerDelay(), useEditor() (+2 more)

### Community 26 - "scene-card.tsx"
Cohesion: 0.19
Nodes (18): Field(), FieldProps, GENERATE_TOOLS, InspectorPanel(), OPEN_TOOLS, SceneInspector(), StoryboardBody(), AssetPreview() (+10 more)

### Community 27 - "ExportService"
Cohesion: 0.15
Nodes (8): ExportController, Body, Controller, Param, Post, UseGuards, ExportService, Injectable

### Community 28 - "research/page.tsx"
Cohesion: 0.24
Nodes (9): ScriptOverlay(), ScriptOverlayProps, ImportStoryboardDialog(), ImportStoryboardDialogProps, ApiError, useImportStoryboard(), scriptKeys, useSaveScript() (+1 more)

### Community 29 - "AssetsProcessor"
Cohesion: 0.07
Nodes (24): AssetsController, SceneAssetsController, Body, Controller, Delete, Get, Param, Post (+16 more)

### Community 30 - "button.tsx"
Cohesion: 0.22
Nodes (8): NewProjectRow(), NewProjectRowProps, Button, ButtonProps, Size, SIZES, Variant, VARIANTS

### Community 31 - "ScriptsController"
Cohesion: 0.21
Nodes (8): FloatingToolbar(), FloatingToolbarProps, TOOLS, InspectorPanelProps, EditorContext, EditorProvider(), EditorState, EditorTool

### Community 36 - "Foundry"
Cohesion: 0.33
Nodes (5): API, Foundry, Дизайн-система, Запуск, Структура

## Knowledge Gaps
- **259 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `webpack` (+254 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `UserId` connect `UserId` to `dependencies`, `ExportService`, `AssetsProcessor`, `ResearchController`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `parseStoryboard()` connect `script.ts` to `ProjectsService`, `dependencies`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _259 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ProjectsService` be split into smaller, more focused modules?**
  _Cohesion score 0.059907834101382486 - nodes in this community are weakly interconnected._
- **Should `UserId` be split into smaller, more focused modules?**
  _Cohesion score 0.07591836734693877 - nodes in this community are weakly interconnected._
- **Should `enums.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._