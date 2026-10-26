import type { EntrySummary } from "@/features/catalog/types";

/** A list row for a test API answer. */
export const entry = (n: number, overrides: Partial<EntrySummary> = {}): EntrySummary => ({
  slug: `question-${n}`,
  group: null,
  title: `Question ${n}`,
  summary: `Summary ${n}`,
  kind: "QUESTION",
  difficulty: "EASY",
  tags: [],
  categorySlug: "react",
  sectionSlug: "interview-questions",
  ...overrides,
});

/** The rows and `meta` the API sends for page `page` of a list of `total` rows (20 per page, like the app asks). */
export function listPage(page: number, total: number, limit = 20) {
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);
  const entries = Array.from({ length: Math.max(0, last - first + 1) }, (_, i) => entry(first + i));
  return { entries, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export const categoriesAnswer = { categories: [{ name: "React", slug: "react", description: null, sectionCount: 2 }] };
