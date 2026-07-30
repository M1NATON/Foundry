"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  CreateProjectDto,
  ProjectListItem,
  UpdateProjectDto,
} from "@foundry/shared-types";
import { api } from "@/lib/api";

/** Полный проект с вложенными research/script/scenes — то, что отдаёт GET /projects/:id */
export interface ProjectDetail {
  id: string;
  userId: string;
  title: string;
  coverUrl: string | null;
  status: ProjectListItem["status"];
  createdAt: string;
  updatedAt: string;
  research: { sources: unknown; notes: string | null } | null;
  script: { content: string; wordCount: number; estSeconds: number } | null;
  scenes: unknown[];
}

export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: string) => ["projects", id] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: () => api.get<ProjectListItem[]>("/projects"),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => api.get<ProjectDetail>(`/projects/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProjectDto) =>
      api.post<ProjectListItem>("/projects", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProjectDto) =>
      api.patch<ProjectListItem>(`/projects/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all });
      qc.invalidateQueries({ queryKey: projectKeys.detail(id) });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<{ id: string }>(`/projects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.all }),
  });
}
