"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Research, UpsertResearchDto } from "@foundry/shared-types";
import { api } from "@/lib/api";
import { projectKeys } from "./projects";

export const researchKeys = {
  detail: (projectId: string) => ["research", projectId] as const,
};

export function useResearch(projectId: string) {
  return useQuery({
    queryKey: researchKeys.detail(projectId),
    queryFn: () => api.get<Research>(`/projects/${projectId}/research`),
    enabled: Boolean(projectId),
  });
}

export function useSaveResearch(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpsertResearchDto) =>
      api.put<Research>(`/projects/${projectId}/research`, dto),
    onSuccess: (research) => {
      qc.setQueryData(researchKeys.detail(projectId), research);
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}
