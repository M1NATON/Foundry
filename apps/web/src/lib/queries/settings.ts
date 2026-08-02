"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DEFAULT_USER_SETTINGS,
  type UpdateUserSettingsDto,
  type UserSettings,
} from "@foundry/shared-types";
import { api } from "@/lib/api";

export const settingsKeys = {
  all: ["settings"] as const,
};

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: () => api.get<UserSettings>("/settings"),
    // Настройки меняются раз в сто лет — перечитывать их незачем.
    staleTime: Infinity,
    placeholderData: DEFAULT_USER_SETTINGS,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateUserSettingsDto) =>
      api.patch<UserSettings>("/settings", dto),
    onSuccess: (settings) => qc.setQueryData(settingsKeys.all, settings),
  });
}
