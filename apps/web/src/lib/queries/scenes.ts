"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  Asset,
  CreateAssetDto,
  CreateSceneDto,
  Scene,
  SetActiveAssetDto,
  UpdateSceneDto,
} from "@foundry/shared-types";
import { isAssetPending } from "@foundry/shared-types";
import { api } from "@/lib/api";
import { projectKeys } from "./projects";

export const sceneKeys = {
  list: (projectId: string) => ["scenes", projectId] as const,
  asset: (assetId: string) => ["assets", assetId] as const,
};

export function useScenes(projectId: string) {
  return useQuery({
    queryKey: sceneKeys.list(projectId),
    queryFn: () => api.get<Scene[]>(`/projects/${projectId}/scenes`),
    enabled: Boolean(projectId),
  });
}

export function useCreateScene(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSceneDto) =>
      api.post<Scene>(`/projects/${projectId}/scenes`, dto),
    onSuccess: () => invalidateProject(qc, projectId),
  });
}

export function useUpdateScene(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSceneDto }) =>
      api.patch<Scene>(`/scenes/${id}`, dto),
    onSuccess: () => invalidateProject(qc, projectId),
  });
}

export function useSetActiveAsset(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sceneId, dto }: { sceneId: string; dto: SetActiveAssetDto }) =>
      api.patch<Scene>(`/scenes/${sceneId}/active-asset`, dto),
    onSuccess: () => invalidateProject(qc, projectId),
  });
}

/** Пересборка промптов по текущей начитке сцены. */
export function useRegeneratePrompts(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sceneId: string) =>
      api.post<Scene>(`/scenes/${sceneId}/prompts`),
    onSuccess: () => invalidateProject(qc, projectId),
  });
}

export function useDuplicateScene(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sceneId: string) =>
      api.post<Scene>(`/scenes/${sceneId}/duplicate`),
    onSuccess: () => invalidateProject(qc, projectId),
  });
}

export function useDeleteScene(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<{ id: string }>(`/scenes/${id}`),
    onSuccess: () => invalidateProject(qc, projectId),
  });
}

export function useReorderScenes(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: Array<{ sceneId: string; newOrder: number }>) =>
      api.post<Scene[]>("/scenes/reorder", { items }),
    // Оптимистично переставляем локально — иначе карточка «прыгает» после ответа.
    onMutate: async (items) => {
      await qc.cancelQueries({ queryKey: sceneKeys.list(projectId) });
      const previous = qc.getQueryData<Scene[]>(sceneKeys.list(projectId));

      if (previous) {
        const orderById = new Map(items.map((i) => [i.sceneId, i.newOrder]));
        qc.setQueryData<Scene[]>(
          sceneKeys.list(projectId),
          [...previous]
            .map((s) => ({ ...s, order: orderById.get(s.id) ?? s.order }))
            .sort((a, b) => a.order - b.order),
        );
      }
      return { previous };
    },
    onError: (_err, _items, context) => {
      if (context?.previous) {
        qc.setQueryData(sceneKeys.list(projectId), context.previous);
      }
    },
    onSettled: () => invalidateProject(qc, projectId),
  });
}

export function useSplitIntoScenes(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<Scene[]>(`/projects/${projectId}/script/split-into-scenes`),
    onSuccess: () => invalidateProject(qc, projectId),
  });
}

/** Импорт раскадровки: сырой JSON от модели разбирает бэкенд. */
export function useImportStoryboard(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (raw: string) =>
      api.post<Scene[]>(`/projects/${projectId}/scenes/import`, { raw }),
    onSuccess: () => invalidateProject(qc, projectId),
  });
}

export function useGenerateAsset(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sceneId, dto }: { sceneId: string; dto: CreateAssetDto }) =>
      api.post<Asset>(`/scenes/${sceneId}/assets`, dto),
    onSuccess: () => invalidateProject(qc, projectId),
  });
}

export function useUploadAsset(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sceneId,
      type,
      file,
    }: {
      sceneId: string;
      type: Asset["type"];
      file: File;
    }) => {
      const form = new FormData();
      form.append("type", type);
      form.append("file", file);
      return api.upload<Asset>(`/scenes/${sceneId}/assets/upload`, form);
    },
    onSuccess: () => invalidateProject(qc, projectId),
  });
}
export function useDeleteAsset(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) =>
      api.del<{ id: string }>(`/assets/${assetId}`),
    onSuccess: () => invalidateProject(qc, projectId),
  });
}

/**
 * Поллинг статуса генерации: 3с, пока QUEUED/GENERATING. Когда ассет
 * дошёл до READY/FAILED — гасим интервал и обновляем список сцен.
 */
export function useAssetPolling(
  projectId: string,
  assetId: string,
  active: boolean,
) {
  const qc = useQueryClient();

  return useQuery({
    queryKey: sceneKeys.asset(assetId),
    queryFn: async () => {
      const asset = await api.get<Asset>(`/assets/${assetId}`);
      if (!isAssetPending(asset.status)) {
        void invalidateProject(qc, projectId);
      }
      return asset;
    },
    enabled: active,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && isAssetPending(status) ? 3000 : false;
    },
  });
}

function invalidateProject(
  qc: ReturnType<typeof useQueryClient>,
  projectId: string,
) {
  return Promise.all([
    qc.invalidateQueries({ queryKey: sceneKeys.list(projectId) }),
    qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) }),
    qc.invalidateQueries({ queryKey: projectKeys.all }),
  ]);
}
