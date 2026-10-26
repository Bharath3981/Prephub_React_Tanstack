import { z } from "zod";
import { kindSchema } from "@/shared/api/schemas";

/**
 * What GET /api/v1/delivery/categories returns inside `data`. The schema is the single source of truth:
 * the TypeScript type is derived from it, so the check at run time and the type at compile time cannot disagree.
 * (Zod ignores fields we did not list, such as a future `icon`.)
 */
export const categorySchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  sectionCount: z.number(),
});

export const categoriesDataSchema = z.object({
  categories: z.array(categorySchema),
});

export type DeliveryCategory = z.infer<typeof categorySchema>;

/** A section of a category, for example "Concepts" or "Interview Questions". */
export const sectionSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  kind: kindSchema,
  entryCount: z.number(),
});
export type DeliverySection = z.infer<typeof sectionSchema>;

/** What GET /api/v1/delivery/categories/{category} returns inside `data`: the category plus its sections. */
export const categoryDetailSchema = categorySchema.extend({ sections: z.array(sectionSchema) });
export const categoryDetailDataSchema = z.object({ category: categoryDetailSchema });
export type DeliveryCategoryDetail = z.infer<typeof categoryDetailSchema>;

/** A tag on an entry, for example "Fiber". */
export const tagSchema = z.object({ name: z.string(), slug: z.string() });
export type Tag = z.infer<typeof tagSchema>;

export const difficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);
export type Difficulty = z.infer<typeof difficultySchema>;

/** One row of GET /delivery/categories/{c}/sections/{s}/entries: enough for a list, not the full body. */
export const entrySummarySchema = z.object({
  slug: z.string(),
  /** The heading the entry sits under inside its section, for example "4. Hooks". */
  group: z.string().nullable(),
  title: z.string(),
  summary: z.string().nullable(),
  kind: kindSchema,
  difficulty: difficultySchema.nullable(),
  tags: z.array(tagSchema),
  /** Where the entry lives, so a link to it can be built from the entry alone. */
  categorySlug: z.string(),
  sectionSlug: z.string(),
});
export type EntrySummary = z.infer<typeof entrySummarySchema>;
export const entriesDataSchema = z.object({ entries: z.array(entrySummarySchema) });

/** `meta` of a list answer: which page, and how many entries exist in total. */
export const pageMetaSchema = z.object({ page: z.number(), limit: z.number(), total: z.number(), totalPages: z.number() });
export type PageMeta = z.infer<typeof pageMetaSchema>;

export interface EntriesPage {
  entries: EntrySummary[];
  meta: PageMeta;
}

/** A link to another entry: used by "related" and by previous/next. */
export const entryLinkSchema = z.object({ title: z.string(), slug: z.string(), categorySlug: z.string(), sectionSlug: z.string() });
export type EntryLink = z.infer<typeof entryLinkSchema>;

/**
 * GET /delivery/categories/{c}/sections/{s}/entries/{slug}: one entry in full. It is the list row plus the body
 * (`bodyHtml`, built by the API from markdown), dates, `meta` (follow-up questions, reading time), the topic and section it
 * sits in, and related entries.
 */
export const entryDetailSchema = entrySummarySchema.extend({
  id: z.string(),
  publishedAt: z.string().nullable(),
  updatedAt: z.string(),
  bodyHtml: z.string(),
  // What `meta` holds depends on the kind: questions have followUps, examples have a scenario and a language, lessons have a reading time.
  meta: z.object({
    followUps: z.array(z.string()).optional(),
    readingMinutes: z.number().optional(),
    scenario: z.string().optional(),
    language: z.string().optional(),
  }),
  category: z.object({ name: z.string(), slug: z.string() }),
  section: z.object({ name: z.string(), slug: z.string(), kind: kindSchema }),
  related: z.array(entryLinkSchema),
});
export type EntryDetail = z.infer<typeof entryDetailSchema>;
export const entryDataSchema = z.object({ entry: entryDetailSchema });
