"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardPaste,
  ImageIcon,
  Mic,
  Music,
  Plus,
  Trash2,
  Upload,
  Video,
  Wand2,
  X,
} from "lucide-react";
import { ACTIVE_ASSET_FIELD_BY_TYPE, type AssetType, type Scene } from "@foundry/shared-types";
import { Button } from "@/components/ui/button";
import { SPRING } from "@/components/ui/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetPreview } from "@/components/scenes/asset-preview";
import { ImportStoryboardDialog } from "@/components/scenes/import-storyboard-dialog";
import {
  useCreateScene,
  useDeleteScene,
  useGenerateAsset,
  useSplitIntoScenes,
  useUpdateScene,
  useUploadAsset,
} from "@/lib/queries/scenes";
import type { EditorTool } from "@/lib/editor-store";
import { useEditor } from "@/lib/editor-store";
import { cn } from "@/lib/utils";

interface InspectorPanelProps {
  projectId: string;
  scene: Scene | null;
  sceneCount: number;
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

const OPEN_TOOLS = new Set<EditorTool>(["storyboard", "frames", "clip", "voice", "music"]);

const ACCEPT_FOR: Record<AssetType, string> = {
  IMAGE: "image/*",
  VIDEO: "video/*",
  VOICE: "audio/*",
  MUSIC: "audio/*",
};

export function InspectorPanel({
  projectId,
  scene,
  sceneCount,
  tool,
  onClose,
}: InspectorPanelProps) {
  const open = OPEN_TOOLS.has(tool) || scene !== null;

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key={tool ?? "scene"}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={SPRING}
          className="absolute right-0 top-0 z-40 flex h-full w-[min(420px,70%)] flex-col
                     border-l border-border bg-surface"
          aria-label="Inspector"
        >
          {tool === "storyboard" ? (
            <StoryboardBody projectId={projectId} sceneCount={sceneCount} />
          ) : scene ? (
            <SceneInspector projectId={projectId} scene={scene} tool={tool} />
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

function StoryboardBody({ projectId, sceneCount }: { projectId: string; sceneCount: number }) {
  const split = useSplitIntoScenes(projectId);
  const createScene = useCreateScene(projectId);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
        <h2 className="font-display text-base tracking-tight">Storyboard</h2>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        <p className="text-xs text-secondary">
          Turn the script into scenes on the timeline.
        </p>
        <Button
          size="sm"
          variant="secondary"
          className="w-full justify-start"
          onClick={() => split.mutate()}
          disabled={split.isPending}
        >
          <Wand2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          {split.isPending ? "Splitting…" : "Split from script"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="w-full justify-start"
          onClick={() => setImportOpen(true)}
        >
          <ClipboardPaste className="h-3.5 w-3.5" strokeWidth={1.75} />
          Import storyboard
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="w-full justify-start"
          onClick={() =>
            createScene.mutate({ title: "New scene", voiceText: "" })
          }
          disabled={createScene.isPending}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          Add scene
        </Button>
      </div>
      <ImportStoryboardDialog
        projectId={projectId}
        sceneCount={sceneCount}
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </>
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
}: {
  projectId: string;
  scene: Scene;
  tool: EditorTool;
}) {
  const updateScene = useUpdateScene(projectId);
  const generate = useGenerateAsset(projectId);
  const upload = useUploadAsset(projectId);
  const deleteScene = useDeleteScene(projectId);
  const { setSelectedSceneId } = useEditor();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<AssetType>("IMAGE");
  const [mode, setMode] = useState<"generate" | "upload">("generate");

  const activeTool = GENERATE_TOOLS.find((t) => t.tool === tool);
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
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
        <Field
          label="Voiceover"
          value={scene.voiceText}
          serif
          onCommit={(voiceText) =>
            updateScene.mutate({ id: scene.id, dto: { voiceText } })
          }
        />
        <Field
          label="Image prompt"
          value={scene.imagePrompt ?? ""}
          onCommit={(imagePrompt) =>
            updateScene.mutate({ id: scene.id, dto: { imagePrompt } })
          }
        />
        <Field
          label="Video prompt"
          value={scene.videoPrompt ?? ""}
          onCommit={(videoPrompt) =>
            updateScene.mutate({ id: scene.id, dto: { videoPrompt } })
          }
        />

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
                {generate.isPending ? "…" : label}
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
            <div className="rounded-lg border border-dashed border-border p-6">
              <p className="text-xs text-secondary">Nothing generated yet.</p>
            </div>
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

interface FieldProps {
  label: string;
  value: string;
  serif?: boolean;
  onCommit: (value: string) => void;
}

function Field({ label, value, serif, onCommit }: FieldProps) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);

  if (!focused && draft !== value) {
    setDraft(value);
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-tight text-secondary">
        {label}
      </span>
      <textarea
        value={draft}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          if (draft !== value) onCommit(draft);
        }}
        onChange={(e) => setDraft(e.target.value)}
        rows={serif ? 4 : 2}
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
