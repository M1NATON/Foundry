import { z } from "zod";
import { ExportFormat } from "./enums";

export const ExportRequestSchema = z.object({
  format: ExportFormat,
});
export type ExportRequestDto = z.infer<typeof ExportRequestSchema>;

export const EXPORT_FORMATS: Array<{
  format: z.infer<typeof ExportFormat>;
  label: string;
  hint: string;
  ext: string;
  mime: string;
}> = [
  { format: "md", label: "Markdown", hint: "Script + scene breakdown", ext: "md", mime: "text/markdown" },
  { format: "txt", label: "Plain text", hint: "Narration only", ext: "txt", mime: "text/plain" },
  { format: "json", label: "JSON", hint: "Full project payload", ext: "json", mime: "application/json" },
  { format: "csv", label: "CSV", hint: "Scene table for spreadsheets", ext: "csv", mime: "text/csv" },
  { format: "srt", label: "SRT", hint: "Subtitles timed per scene", ext: "srt", mime: "application/x-subrip" },
];
