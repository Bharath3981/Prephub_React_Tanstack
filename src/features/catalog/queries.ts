import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { getCategories, getCategory, getEntries, type EntriesQuery } from "@/features/catalog/api";
import type { EntriesPage } from "@/features/catalog/types";

/**
 * QUERY KEYS. A key is the address of one piece of cached data: same key, same cache entry, shared by every component.
 * Keys are arrays that go from general to specific, so one prefix can match a whole group:
 *
 *   ["catalog"]                       everything about the catalog
 *   ["catalog", "categories"]         everything about categories (the list AND, later, each category)
 *   ["catalog", "categories", "list"] just the list of all categories
 *   ["catalog", "categories", "detail", "react"]  one category with its sections
 *   ["catalog", "entries", "react", "interview-questions", "list", { page: 2 }]  one page of one section's entries
 *
 * Invalidating ["catalog", "categories"] marks the list and every single category as stale at once.
 * Keys are built in ONE place (this factory), never typed by hand in components, so a typo cannot create a second cache entry.
 */
export const catalogKeys = {
  all: ["catalog"] as const,
  categories: () => [...catalogKeys.all, "categories"] as const,
  categoryList: () => [...catalogKeys.categories(), "list"] as const,
  categoryDetail: (slug: string) => [...catalogKeys.categories(), "detail", slug] as const,
  entries: () => [...catalogKeys.all, "entries"] as const,
  /** Every cached page of one section: invalidate this after editing an entry and all its pages refresh. */
  sectionEntries: (categorySlug: string, sectionSlug: string) => [...catalogKeys.entries(), categorySlug, sectionSlug] as const,
  entryList: (categorySlug: string, sectionSlug: string, params: EntriesQuery) => [...catalogKeys.sectionEntries(categorySlug, sectionSlug), "list", params] as const,
};

/**
 * `queryOptions` bundles a key and the function that fills it, with full types. The same object is used by
 * useQuery in a component, prefetchQuery before navigation and getQueryData in a test: the key and the fetcher can never drift apart.
 */
export const categoryQueries = {
  list: () =>
    queryOptions({
      queryKey: catalogKeys.categoryList(),
      // Query passes an AbortSignal: if the component goes away before the answer, the request is cancelled.
      queryFn: ({ signal }) => getCategories(signal),
    }),
  detail: (slug: string) =>
    queryOptions({
      queryKey: catalogKeys.categoryDetail(slug),
      queryFn: ({ signal }) => getCategory(slug, signal),
    }),
};

/**
 * The same text typed with different spaces, or "" and undefined, must be ONE cache entry. So the params are cleaned
 * before they become part of a key (undefined values are ignored when keys are compared, "" is not).
 */
const cleanParams = (params: EntriesQuery): EntriesQuery => ({ ...params, search: params.search?.trim() || undefined });

export const entryQueries = {
  list: (categorySlug: string, sectionSlug: string, params: EntriesQuery = {}) => {
    const clean = cleanParams(params);
    return queryOptions({
      queryKey: catalogKeys.entryList(categorySlug, sectionSlug, clean),
      queryFn: ({ signal }) => getEntries(categorySlug, sectionSlug, clean, signal),
    });
  },
};

/** Every entry of a section in one request (the API's maximum is 100): the side panel is built from it. */
export const SECTION_PANEL_PARAMS: EntriesQuery = { limit: 100 };

/**
 * "Keep showing the previous page while the next one loads" (placeholderData), but ONLY inside the same section.
 * keepPreviousData alone would also show the last page of another section while a new section loads: wrong data under a new title.
 * The key is read back: ["catalog", "entries", categorySlug, sectionSlug, ...].
 */
export const keepPageInSection =
  (categorySlug: string, sectionSlug: string) =>
  (previous: EntriesPage | undefined, previousQuery: { queryKey: readonly unknown[] } | undefined): EntriesPage | undefined =>
    previousQuery?.queryKey[2] === categorySlug && previousQuery.queryKey[3] === sectionSlug ? keepPreviousData(previous) : undefined;
