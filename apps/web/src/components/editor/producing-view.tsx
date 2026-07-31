"use client";

import type { Scene, Script } from "@foundry/shared-types";
import { InspectorPanel } from "@/components/editor/inspector-panel";
import { Stage } from "@/components/editor/stage";
import { Timeline } from "@/components/editor/timeline";
import { useEditor } from "@/lib/editor-store";
import type { SceneFieldUpdater } from "@/lib/queries/scenes";

interface ProducingViewProps {
  projectId: string;
  scenes: Scene[];
  script: Script | null;
  onUpdateSceneField: SceneFieldUpdater;
}

/**
 * Этап Producing: работа над отдельной сценой — канвас, таймлайн и
 * инспектор с промптами и ассетами. Состав и порядок сцен правятся
 * этапом раньше, в списке раскадровки.
 */
export function ProducingView({
  projectId,
  scenes,
  script,
  onUpdateSceneField,
}: ProducingViewProps) {
  const { tool, setTool, setStep, selectedSceneId, setSelectedSceneId } =
    useEditor();
  const selectedScene = scenes.find((s) => s.id === selectedSceneId) ?? null;

  return (
    <>
      <div className="relative flex min-w-0 flex-1 flex-col">
        <Stage
          scene={selectedScene}
          script={script}
          onUpdateSceneField={onUpdateSceneField}
          onOpenScript={() => setStep("script")}
        />

        <Timeline projectId={projectId} scenes={scenes} script={script} />
      </div>

      <InspectorPanel
        projectId={projectId}
        scene={selectedScene}
        scenes={scenes}
        tool={tool}
        onUpdateSceneField={onUpdateSceneField}
        onClose={() => {
          setTool(null);
          setSelectedSceneId(null);
        }}
      />
    </>
  );
}
