import { z } from "zod";

export const SourceSchema = z.object({
  title: z.string().trim().min(1),
  url: z.string().trim(),
  note: z.string().trim().default(""),
});
export type Source = z.infer<typeof SourceSchema>;

export const UpsertResearchSchema = z.object({
  sources: z.array(SourceSchema).default([]),
  notes: z.string().default(""),
});
export type UpsertResearchDto = z.infer<typeof UpsertResearchSchema>;

export const ResearchSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  sources: z.array(SourceSchema),
  notes: z.string().nullable(),
});
export type Research = z.infer<typeof ResearchSchema>;
