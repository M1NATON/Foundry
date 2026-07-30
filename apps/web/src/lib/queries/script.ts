"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Script, UpsertScriptDto } from "@foundry/shared-types";
import { api } from "@/lib/api";
import { projectKeys } from "./projects";

export const scriptKeys = {
  detail: (projectId: string) => ["script", projectId] as const,
};

export function useScript(projectId: string) {
  return useQuery({
    queryKey: scriptKeys.detail(projectId),
    queryFn: () => api.get<Script>(`/projects/${projectId}/script`),
    enabled: Boolean(projectId),
  });
}

export function useSaveScript(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpsertScriptDto) =>
      api.put<Script>(`/projects/${projectId}/script`, dto),
    onSuccess: (script) => {
      qc.setQueryData(scriptKeys.detail(projectId), script);
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}
