"use client";

import {
  VISUAL_STYLE_CUSTOM_MAX,
  VISUAL_STYLE_PRESETS,
  type VisualStyleKey,
} from "@foundry/shared-types";

interface VisualStyleFieldProps {
  value: VisualStyleKey;
  custom: string;
  onChange: (key: VisualStyleKey) => void;
  onCustomChange: (text: string) => void;
  onCustomCommit: () => void;
  label?: string;
}

/**
 * Выбор визуального стиля. Живёт отдельно от обоих мест, где его показывают:
 * в модалке импорта он задаёт стиль проекта, в настройках — стиль для новых
 * проектов, а список пресетов должен быть один и тот же.
 */
export function VisualStyleField({
  value,
  custom,
  onChange,
  onCustomChange,
  onCustomCommit,
  label = "Visual style",
}: VisualStyleFieldProps) {
  const preset = VISUAL_STYLE_PRESETS.find((p) => p.key === value);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs text-secondary">
        {label}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as VisualStyleKey)}
          className="rounded-sm border border-border bg-bg px-1.5 py-1 text-xs
                     text-primary outline-none transition-colors
                     focus:border-secondary/40"
        >
          {VISUAL_STYLE_PRESETS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        {value !== "custom" && preset && (
          <span className="min-w-0 truncate text-secondary/80">
            {preset.hint}
          </span>
        )}
      </label>

      {value === "custom" && (
        <textarea
          value={custom}
          onChange={(e) => onCustomChange(e.target.value)}
          onBlur={onCustomCommit}
          rows={2}
          maxLength={VISUAL_STYLE_CUSTOM_MAX}
          placeholder="Describe the look you want — palette, level of detail, lighting."
          className="w-full resize-none rounded-sm border border-border bg-bg px-2.5 py-2
                     text-xs leading-relaxed outline-none transition-colors
                     focus:border-secondary/40 placeholder:text-secondary/60"
        />
      )}
    </div>
  );
}
