"use client";

import { useEffect, useRef } from "react";
import { useEditor } from "@/lib/editor-store";
import { useScenes } from "@/lib/queries/scenes";
import { useScript } from "@/lib/queries/script";
import { ProducingView } from "@/components/editor/producing-view";
import { ResearchView } from "@/components/editor/research-view";
import { ScriptView } from "@/components/editor/script-view";
import { StoryboardListView } from "@/components/editor/storyboard-list-view";

interface EditorWorkspaceProps {
  projectId: string;
}

/**
 * Переключатель этапов пайплайна: Research → Script → Storyboard → Producing.
 * Виды взаимоисключающие: в DOM живёт ровно один из них, никаких оверлеев
 * поверх постоянно смонтированного канваса. Данные (сцены, скрипт, research)
 * берутся из кеша React Query, поэтому размонтирование вида не теряет правок.
 */
export function EditorWorkspace({ projectId }: EditorWorkspaceProps) {
  const { step, setStep } = useEditor();
  const { data: scenes, isSuccess } = useScenes(projectId);
  const { data: script } = useScript(projectId);

  // Пустой проект открывается на Script: раскадровку и продакшн не с чего
  // начинать. Один раз на проект — дальше этап выбирает только пользователь.
  const initializedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!isSuccess || initializedFor.current === projectId) return;
    initializedFor.current = projectId;
    if (scenes && scenes.length === 0) setStep("script");
  }, [isSuccess, scenes, projectId, setStep]);

  return (
    <div className="relative flex min-w-0 flex-1">
      {step === "research" && <ResearchView projectId={projectId} />}

      {step === "script" && <ScriptView projectId={projectId} />}

      {step === "storyboard" && (
        <StoryboardListView
          projectId={projectId}
          scenes={scenes ?? []}
          script={script ?? null}
        />
      )}

      {step === "producing" && (
        <ProducingView
          projectId={projectId}
          scenes={scenes ?? []}
          script={script ?? null}
        />
      )}
    </div>
  );
}
