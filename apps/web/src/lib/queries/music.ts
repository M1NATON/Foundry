"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  Asset,
  CreateAssetDto,
  ProjectMusic,
} from "@foundry/shared-types";
import { isAssetPending } from "@foundry/shared-types";
import { api } from "@/lib/api";
import { projectKeys } from "./projects";

/**
 * Музыка живёт на проекте, а не на сцене, поэтому у неё свой ключ кеша:
 * список сцен её не содержит и инвалидировать его ради трека незачем.
 */
export const musicKeys = {
  project: (projectId: string) => ["music", projectId] as const,
};

export function useProjectMusic(projectId: string) {
  return useQuery({
    queryKey: musicKeys.project(projectId),
    queryFn: () => api.get<ProjectMusic>(`/projects/${projectId}/music`),
    enabled: Boolean(projectId),
    // Пока трек генерируется — тот же поллинг, что у ассетов сцены.
    refetchInterval: (query) =>
      query.state.data?.assets.some((a) => isAssetPending(a.status))
        ? 3000
        : false,
  });
}

export function useGenerateProjectMusic(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAssetDto) =>
      api.post<Asset>(`/projects/${projectId}/music`, dto),
    onSuccess: () => invalidateMusic(qc, projectId),
  });
}

export function useUploadProjectMusic(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return api.upload<Asset>(`/projects/${projectId}/music/upload`, form);
    },
    onSuccess: () => invalidateMusic(qc, projectId),
  });
}

/** Выбор базового трека; null снимает музыку с проекта. */
export function useSetProjectMusic(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string | null) =>
      api.patch<ProjectMusic>(`/projects/${projectId}/music`, { assetId }),
    onSuccess: () => invalidateMusic(qc, projectId),
  });
}

export function useDeleteProjectMusic(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) =>
      api.del<{ id: string }>(`/assets/${assetId}`),
    onSuccess: () => invalidateMusic(qc, projectId),
  });
}

function invalidateMusic(
  qc: ReturnType<typeof useQueryClient>,
  projectId: string,
) {
  return Promise.all([
    qc.invalidateQueries({ queryKey: musicKeys.project(projectId) }),
    qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) }),
  ]);
}
