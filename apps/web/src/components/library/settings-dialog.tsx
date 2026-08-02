"use client";

import { useState } from "react";
import {
  DEFAULT_VISUAL_STYLE,
  type VisualStyleKey,
} from "@foundry/shared-types";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { VisualStyleField } from "@/components/scenes/visual-style-field";
import { useSettings, useUpdateSettings } from "@/lib/queries/settings";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Настройки пользователя. Стиль здесь — не стиль текущего ролика, а тот, с
 * которого начинают новые: у автора обычно один визуальный язык на канал.
 */
export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const [customDraft, setCustomDraft] = useState<string | null>(null);

  const style = settings?.defaultVisualStyle ?? DEFAULT_VISUAL_STYLE;
  const custom = customDraft ?? settings?.defaultVisualStyleCustom ?? "";

  function setStyle(key: VisualStyleKey) {
    setCustomDraft(null);
    updateSettings.mutate({
      defaultVisualStyle: key,
      defaultVisualStyleCustom: key === "custom" ? custom.trim() || null : null,
    });
  }

  function saveCustom() {
    if (customDraft === null) return;
    const trimmed = customDraft.trim();
    setCustomDraft(null);
    if (trimmed !== (settings?.defaultVisualStyleCustom ?? "").trim()) {
      updateSettings.mutate({
        defaultVisualStyle: "custom",
        defaultVisualStyleCustom: trimmed || null,
      });
    }
  }

  return (
    <Dialog
      id="settings"
      open={open}
      onClose={onClose}
      ariaLabel="Settings"
      className="w-[440px]"
      header={
        <h2 className="font-display text-lg tracking-tight">Settings</h2>
      }
    >
      <div className="space-y-4 px-5 py-4">
        <p className="text-xs text-secondary">
          The visual style new projects start with. Projects that never had a
          style of their own follow it too — you can override it per project in
          Import storyboard.
        </p>

        <VisualStyleField
          value={style}
          custom={custom}
          onChange={setStyle}
          onCustomChange={setCustomDraft}
          onCustomCommit={saveCustom}
          label="Default style"
        />

        <div className="flex items-center justify-end">
          <Button size="sm" variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
