import { infiniteQueryOptions, keepPreviousData, queryOptions, type QueryClient } from "@tanstack/react-query";
import { getCategories, getCategory, getEntries, getEntry, getQuestions, getTag, getTags, type EntriesQuery, type QuestionsQuery } from "@/features/catalog/api";
import type { EntriesPage, EntrySummary, TagEntries, TagsPage, TagWithCount } from "@/features/catalog/types";

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
  /** One entry in full. It sits under the same section prefix as the lists, so invalidating `sectionEntries` refreshes both, and each can still be targeted alone. */
  entryDetail: (categorySlug: string, sectionSlug: string, entrySlug: string) => [...catalogKeys.entries(), categorySlug, sectionSlug, "detail", entrySlug] as const,
  questions: () => [...catalogKeys.all, "questions"] as const,
  /** One page of questions with its filters (the paged view). */
  questionList: (params: QuestionsQuery) => [...catalogKeys.questions(), "list", params] as const,
  /** ALL loaded pages of questions with these filters (the infinite view): the page number is NOT in this key, it is the page PARAM. */
  questionFeed: (params: QuestionsQuery) => [...catalogKeys.questions(), "feed", params] as const,
  tags: () => [...catalogKeys.all, "tags"] as const,
  tagList: (page: number) => [...catalogKeys.tags(), "list", { page }] as const,
  tagDetail: (slug: string, page: number) => [...catalogKeys.tags(), "detail", slug, { page }] as const,
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

/** The full entry (with its body). Used by the entry page, and by prefetching on hover and for previous and next. */
export const entryDetailQuery = (categorySlug: string, sectionSlug: string, entrySlug: string) =>
  queryOptions({
    queryKey: catalogKeys.entryDetail(categorySlug, sectionSlug, entrySlug),
    queryFn: ({ signal }) => getEntry(categorySlug, sectionSlug, entrySlug, signal),
  });

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

/**
 * Looks for the list row of an entry in ANY list page already in the cache (a section page, a filtered page, the side panel).
 * The row has the title, summary, kind, difficulty and tags: enough to draw the top of the entry page at once while the
 * full entry (with the body) loads.
 *
 * Why not `initialData` for the entry query? initialData must have the SAME shape as the query's data. A list row has no
 * body, so putting it in the entry cache would store a half-entry that looks complete (and `staleTime` could even keep it).
 * Reading it on the side keeps the entry cache honest: it holds full entries only.
 */
export function findCachedEntrySummary(client: QueryClient, categorySlug: string, sectionSlug: string, entrySlug: string): EntrySummary | undefined {
  for (const [key, page] of client.getQueriesData<EntriesPage>({ queryKey: catalogKeys.sectionEntries(categorySlug, sectionSlug) })) {
    if (key[4] !== "list" || !page) continue; // the same prefix also holds opened entries; only list pages have `entries`
    const hit = page.entries.find((entry) => entry.slug === entrySlug);
    if (hit) return hit;
  }
  return undefined;
}

// ---------------------------------------------------------------------------------------------
// Questions (every topic) and tags
// ---------------------------------------------------------------------------------------------

/** Filters in a stable form: no empty strings, so "" and undefined are the same cache entry. */
const cleanQuestionParams = (params: QuestionsQuery): QuestionsQuery => ({ ...params, search: params.search?.trim() || undefined });

export const questionQueries = {
  /** One page, for the paged view. */
  list: (params: QuestionsQuery = {}) => {
    const clean = cleanQuestionParams(params);
    return queryOptions({
      queryKey: catalogKeys.questionList(clean),
      queryFn: ({ signal }) => getQuestions(clean, signal),
    });
  },
  /**
   * Every page loaded so far as ONE cache entry, for "load more" and infinite scroll. The API numbers its pages, so the
   * page param is the next page number; `getNextPageParam` says which one comes next, or undefined when the last page is loaded.
   */
  feed: (params: QuestionsQuery = {}) => {
    const clean = cleanQuestionParams(params);
    return infiniteQueryOptions({
      queryKey: catalogKeys.questionFeed(clean),
      queryFn: ({ pageParam, signal }) => getQuestions({ ...clean, page: pageParam }, signal),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined),
    });
  },
};

/** The API sends at most 100 tags per page. */
export const TAGS_PER_PAGE = 100;

export const tagQueries = {
  list: (page: number) =>
    queryOptions({
      queryKey: catalogKeys.tagList(page),
      queryFn: ({ signal }) => getTags({ page, limit: TAGS_PER_PAGE }, signal),
    }),
  /** One tag and one page of its entries. An unknown slug is a 404 (not retried). */
  detail: (slug: string, page: number, limit: number) =>
    queryOptions({
      queryKey: catalogKeys.tagDetail(slug, page),
      queryFn: ({ signal }) => getTag(slug, { page, limit }, signal),
    }),
};

/**
 * "Keep the previous result while the next loads", but only while it is about the SAME thing: the same value at `position`
 * of the key. Used for a tag's pages: the next page of #Closures keeps the old one dimmed, but opening another tag never
 * shows the last tag's entries.
 */
export const keepWhileSame =
  <T,>(position: number, value: unknown) =>
  (previous: T | undefined, previousQuery: { queryKey: readonly unknown[] } | undefined): T | undefined =>
    previousQuery?.queryKey[position] === value ? keepPreviousData(previous) : undefined;

/** Looks for a tag (with its count) in any cached page of the tag list: enough to draw the tag page's header at once. */
export function findCachedTag(client: QueryClient, slug: string): TagWithCount | undefined {
  for (const [, page] of client.getQueriesData<TagsPage>({ queryKey: [...catalogKeys.tags(), "list"] })) {
    const hit = page?.tags.find((tag) => tag.slug === slug);
    if (hit) return hit;
  }
  return undefined;
}

export type { TagEntries };
