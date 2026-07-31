"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Copy,
  ImageIcon,
  RefreshCw,
  Mic,
  Music,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import {
  ACTIVE_ASSET_FIELD_BY_TYPE,
  type AssetType,
  type Scene,
} from "@foundry/shared-types";
import { Button } from "@/components/ui/button";
import { SPRING } from "@/components/ui/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetPreview } from "@/components/scenes/asset-preview";
import {
  useDeleteScene,
  useDuplicateScene,
  useGenerateAsset,
  useRegeneratePrompts,
  useUpdateScene,
  useUploadAsset,
} from "@/lib/queries/scenes";
import { useSceneField } from "@/lib/use-scene-field";
import type { EditorTool } from "@/lib/editor-store";
import { useEditor } from "@/lib/editor-store";
import { cn } from "@/lib/utils";

interface InspectorPanelProps {
  projectId: string;
  scene: Scene | null;
  scenes: Scene[];
  tool: EditorTool;
  onClose: () => void;
}

const GENERATE_TOOLS: Array<{
  tool: "frames" | "clip" | "voice" | "music";
  type: AssetType;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}> = [
  { tool: "frames", type: "IMAGE", label: "Frame", icon: ImageIcon },
  { tool: "clip", type: "VIDEO", label: "Clip", icon: Video },
  { tool: "voice", type: "VOICE", label: "Voice", icon: Mic },
  { tool: "music", type: "MUSIC", label: "Music", icon: Music },
];

const OPEN_TOOLS = new Set<EditorTool>(["frames", "clip", "voice", "music"]);

const ACCEPT_FOR: Record<AssetType, string> = {
  IMAGE: "image/*",
  VIDEO: "video/*",
  VOICE: "audio/*",
  MUSIC: "audio/*",
};

export function InspectorPanel({
  projectId,
  scene,
  scenes,
  tool,
  onClose,
}: InspectorPanelProps) {
  const open = OPEN_TOOLS.has(tool) || scene !== null;
  const { setSelectedSceneId } = useEditor();

  // Alt+←/→ переходит к соседней сцене, пока фокус внутри инспектора —
  // ускоряет последовательное заполнение полей многих сцен подряд.
  function onKeyDown(e: React.KeyboardEvent) {
    if (!scene || !e.altKey) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const idx = scenes.findIndex((s) => s.id === scene.id);
    if (idx === -1) return;
    const nextIdx = e.key === "ArrowLeft" ? idx - 1 : idx + 1;
    const next = scenes[nextIdx];
    if (!next) return;
    e.preventDefault();
    setSelectedSceneId(next.id);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key={tool ?? "scene"}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={SPRING}
          onKeyDown={onKeyDown}
          // В потоке, а не поверх канваса: иначе инспектор наезжает на
          // превью и видео не помещается в оставшееся место целиком.
          className="flex h-full w-[340px] shrink-0 flex-col border-l border-border
                     bg-surface xl:w-[420px]"
          aria-label="Inspector"
        >
          {scene ? (
            <SceneInspector
              projectId={projectId}
              scene={scene}
              tool={tool}
              onClose={onClose}
            />
          ) : (
            <EmptySelection />
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function EmptySelection() {
  return (
    <div className="flex flex-1 items-center justify-center px-8 text-center">
      <p className="text-sm text-secondary">
        Select a scene on the timeline to work on it.
      </p>
    </div>
  );
}

function SceneTitle({
  title,
  onRename,
}: {
  title: string;
  onRename: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  if (!editing && draft !== title) setDraft(title);

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title) onRename(trimmed);
    else setDraft(title);
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setDraft(title);
            setEditing(false);
          }
        }}
        className="min-w-0 flex-1 border-b border-secondary/40 bg-transparent font-display
                   text-base tracking-tight outline-none"
      />
    );
  }

  return (
    <h2
      onClick={() => setEditing(true)}
      title={title}
      className="min-w-0 flex-1 cursor-text truncate rounded-sm font-display text-base
                 tracking-tight hover:bg-border/30"
    >
      {title}
    </h2>
  );
}

function SceneInspector({
  projectId,
  scene,
  tool,
  onClose,
}: {
  projectId: string;
  scene: Scene;
  tool: EditorTool;
  onClose: () => void;
}) {
  const voice = useSceneField(projectId, scene, "voiceText");
  const imagePrompt = useSceneField(projectId, scene, "imagePrompt");
  const videoPrompt = useSceneField(projectId, scene, "videoPrompt");
  const updateScene = useUpdateScene(projectId);
  const generate = useGenerateAsset(projectId);
  const upload = useUploadAsset(projectId);
  const deleteScene = useDeleteScene(projectId);
  const duplicateScene = useDuplicateScene(projectId);
  const regeneratePrompts = useRegeneratePrompts(projectId);
  const { setSelectedSceneId } = useEditor();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<AssetType>("IMAGE");
  const [mode, setMode] = useState<"generate" | "upload">("generate");

  const activeTool = GENERATE_TOOLS.find((t) => t.tool === tool);
  const emptyGenerateTool = activeTool ?? GENERATE_TOOLS[0];
  const pendingGenerateType = generate.isPending
    ? generate.variables?.dto.type
    : undefined;
  const relevantAssets = activeTool
    ? scene.assets.filter((a) => a.type === activeTool.type)
    : scene.assets;

  function pickFile(type: AssetType) {
    setUploadType(type);
    fileInput.current?.click();
  }

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    upload.mutate({ sceneId: scene.id, type: uploadType, file });
  }

  return (
    <>
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-5 py-3">
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPT_FOR[uploadType]}
          className="hidden"
          onChange={onFileChosen}
        />
        <SceneTitle
          title={scene.title}
          onRename={(title) => updateScene.mutate({ id: scene.id, dto: { title } })}
        />
        <span className="shrink-0 text-xs text-secondary">
          Scene {String(scene.order + 1).padStart(2, "0")}
        </span>
        <button
          onClick={() =>
            duplicateScene.mutate(scene.id, {
              onSuccess: (copy) => setSelectedSceneId(copy.id),
            })
          }
          disabled={duplicateScene.isPending}
          aria-label="Duplicate scene"
          title="Duplicate scene (voiceover and prompts, without assets)"
          className="shrink-0 rounded-sm p-1 text-secondary transition-colors hover:bg-border/40 hover:text-primary"
        >
          <Copy className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          onClick={() => {
            deleteScene.mutate(scene.id);
            setSelectedSceneId(null);
          }}
          disabled={deleteScene.isPending}
          aria-label="Delete scene"
          className="shrink-0 rounded-sm p-1 text-secondary transition-colors hover:bg-border/40 hover:text-error"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          onClick={onClose}
          aria-label="Close inspector"
          className="shrink-0 rounded-sm p-1 text-secondary transition-colors hover:bg-border/40 hover:text-primary"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
        <SceneTextarea
          label="Voiceover"
          rows={4}
          serif
          field={voice}
        />
        <SceneTextarea label="Image prompt" rows={2} field={imagePrompt} />
        <SceneTextarea label="Video prompt" rows={2} field={videoPrompt} />

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => regeneratePrompts.mutate(scene.id)}
            disabled={regeneratePrompts.isPending || !scene.voiceText.trim()}
            title="Rewrite both prompts from the current voiceover"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
            {regeneratePrompts.isPending
              ? "Rewriting…"
              : "Prompts from voiceover"}
          </Button>
          {regeneratePrompts.isError && (
            <span className="text-xs text-accent">Could not rewrite them.</span>
          )}
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "generate" | "upload")}>
          <TabsList>
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
          <TabsContent value="generate" className="mt-3 grid grid-cols-2 gap-2">
            {GENERATE_TOOLS.map(({ tool: t, type, label, icon: Icon }) => (
              <Button
                key={t}
                size="sm"
                variant={activeTool?.tool === t ? "primary" : "secondary"}
                onClick={() =>
                  generate.mutate({
                    sceneId: scene.id,
                    dto: { type, provider: "gemini" },
                  })
                }
                disabled={generate.isPending}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {pendingGenerateType === type ? "Generating…" : label}
              </Button>
            ))}
          </TabsContent>
          <TabsContent value="upload" className="mt-3 grid grid-cols-2 gap-2">
            {GENERATE_TOOLS.map(({ tool: t, type, label, icon: Icon }) => (
              <button
                key={t}
                onClick={() => pickFile(type)}
                disabled={upload.isPending}
                className={cn(
                  "flex h-9 items-center justify-center gap-1.5 rounded-sm border border-dashed border-border",
                  "text-xs text-secondary transition-colors hover:border-secondary/40 hover:text-primary",
                  "disabled:opacity-50",
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                <Upload className="h-3 w-3" strokeWidth={1.75} />
                {upload.isPending && uploadType === type ? "Uploading…" : label}
              </button>
            ))}
          </TabsContent>
        </Tabs>

        <div>
          <p className="mb-3 text-xs uppercase tracking-tight text-secondary">
            Assets
          </p>
          {relevantAssets.length === 0 ? (
            <button
              onClick={() =>
                generate.mutate({
                  sceneId: scene.id,
                  dto: { type: emptyGenerateTool.type, provider: "gemini" },
                })
              }
              disabled={generate.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg border
                         border-dashed border-border p-6 text-xs text-secondary
                         transition-colors hover:border-secondary/40 hover:text-primary
                         disabled:cursor-default disabled:opacity-60"
            >
              {pendingGenerateType === emptyGenerateTool.type ? (
                <>
                  <span className="h-4 w-4 animate-pulse rounded-full bg-accent" />
                  Generating {emptyGenerateTool.label.toLowerCase()}…
                </>
              ) : (
                `Nothing generated yet — generate a ${emptyGenerateTool.label.toLowerCase()}.`
              )}
            </button>
          ) : (
            <div className="space-y-3">
              {relevantAssets.map((asset) => (
                <AssetPreview
                  key={asset.id}
                  asset={asset}
                  projectId={projectId}
                  sceneId={scene.id}
                  isActive={scene[ACTIVE_ASSET_FIELD_BY_TYPE[asset.type]] === asset.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface SceneTextareaProps {
  label: string;
  rows: number;
  serif?: boolean;
  field: ReturnType<typeof useSceneField>;
}

/**
 * Поле сцены с живым вводом: тот же useSceneField, что и на канвасе,
 * поэтому набранное здесь сразу видно там (и наоборот).
 */
function SceneTextarea({ label, rows, serif, field }: SceneTextareaProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-tight text-secondary">
        {label}
      </span>
      <textarea
        {...field.fieldProps}
        rows={rows}
        spellCheck={false}
        className={cn(
          "w-full resize-none rounded-md border border-border bg-surface px-3 py-2",
          "text-sm leading-relaxed outline-none transition-colors",
          "focus:border-secondary/40",
          serif && "font-display tracking-tight",
        )}
      />
    </label>
  );
}
