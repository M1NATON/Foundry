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
  /** Таймлайн для монтажки против текстового документа — разные полки в UI. */
  group: "timeline" | "document";
}> = [
  { format: "resolve-pack", label: "Resolve pack", hint: "ZIP: FCPXML + media + SRT, nothing to relink", ext: "zip", mime: "application/zip", group: "timeline" },
  { format: "fcpxml", label: "FCPXML", hint: "Timeline for Resolve, Premiere, Final Cut", ext: "fcpxml", mime: "application/xml", group: "timeline" },
  { format: "edl", label: "EDL", hint: "Cuts only — read by every editor", ext: "edl", mime: "text/plain", group: "timeline" },
  { format: "md", label: "Markdown", hint: "Script + scene breakdown", ext: "md", mime: "text/markdown", group: "document" },
  { format: "txt", label: "Plain text", hint: "Narration only", ext: "txt", mime: "text/plain", group: "document" },
  { format: "json", label: "JSON", hint: "Full project payload", ext: "json", mime: "application/json", group: "document" },
  { format: "csv", label: "CSV", hint: "Scene table for spreadsheets", ext: "csv", mime: "text/csv", group: "document" },
  { format: "srt", label: "SRT", hint: "Subtitles timed per scene", ext: "srt", mime: "application/x-subrip", group: "document" },
  { format: "prompts", label: "Prompts", hint: "Image + video prompts per scene", ext: "txt", mime: "text/plain", group: "document" },
];
