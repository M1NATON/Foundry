"use client";

import { useEditor } from "@/lib/editor-store";
import { useScenes, useUpdateSceneField } from "@/lib/queries/scenes";
import { useScript } from "@/lib/queries/script";
import { FloatingToolbar } from "@/components/editor/floating-toolbar";
import { InspectorPanel } from "@/components/editor/inspector-panel";
import { ScriptView } from "@/components/editor/script-view";
import { Stage } from "@/components/editor/stage";
import { Timeline } from "@/components/editor/timeline";

interface EditorWorkspaceProps {
  projectId: string;
}

/**
 * Переключатель видов пайплайна. Виды взаимоисключающие: в DOM живёт ровно
 * один из них, никаких оверлеев поверх постоянно смонтированного канваса.
 * Данные (сцены, скрипт) берутся из кеша React Query, поэтому размонтирование
 * вида не теряет ни правок, ни несохранённого текста.
 */
export function EditorWorkspace({ projectId }: EditorWorkspaceProps) {
  const { step, setStep, tool, setTool, selectedSceneId } = useEditor();
  const { data: scenes } = useScenes(projectId);
  const { data: script } = useScript(projectId);
  const updateSceneField = useUpdateSceneField(projectId);

  const selectedScene = scenes?.find((s) => s.id === selectedSceneId) ?? null;

  return (
    <div className="relative flex min-w-0 flex-1">
      {step === "script" ? (
        <ScriptView projectId={projectId} />
      ) : (
        <>
          <div className="relative flex min-w-0 flex-1 flex-col">
            <Stage
              scene={selectedScene}
              script={script ?? null}
              onUpdateSceneField={updateSceneField}
              onOpenScript={() => setStep("script")}
            />

            <Timeline
              projectId={projectId}
              scenes={scenes ?? []}
              script={script ?? null}
            />
          </div>

          <InspectorPanel
            projectId={projectId}
            scene={selectedScene}
            scenes={scenes ?? []}
            sceneCount={scenes?.length ?? 0}
            tool={tool}
            onUpdateSceneField={updateSceneField}
            onClose={() => setTool(null)}
          />
        </>
      )}

      <FloatingToolbar step={step} onStepChange={setStep} />
    </div>
  );
}
