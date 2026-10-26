import { useCallback } from "react";
import { useSearchParams, type To } from "react-router";
import { difficultySchema, type Difficulty } from "@/features/catalog/types";

export const PAGE_SIZE = 20;

/** The list's filters and page. They live in the URL (?page=2&difficulty=HARD&search=fiber), so a link or a refresh gives the same list. */
export interface ListParams {
  page: number;
  difficulty: Difficulty | undefined;
  search: string;
  /** A topic (category slug). Used by the Questions page; a section already knows its topic. */
  category: string | undefined;
  /** A tag slug. Used by the Questions page. */
  tag: string | undefined;
  /** The Questions page: numbered pages, or one growing list (load more and infinite scroll). */
  view: "pages" | "infinite";
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const readSlug = (value: string | null) => (value && value.length <= 100 && SLUG.test(value) ? value : undefined);

/** Read the three values and repair anything odd: the URL is typed by people, and the API would answer 400 for ?page=0 or ?difficulty=x. */
function readParams(searchParams: URLSearchParams): ListParams {
  const page = Number(searchParams.get("page"));
  const difficulty = difficultySchema.safeParse(searchParams.get("difficulty"));
  return {
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    difficulty: difficulty.success ? difficulty.data : undefined,
    search: (searchParams.get("search") ?? "").slice(0, 100),
    category: readSlug(searchParams.get("category")),
    tag: readSlug(searchParams.get("tag")),
    view: searchParams.get("view") === "infinite" ? "infinite" : "pages",
  };
}

/** A new query string from the current params and a change. A filter change goes back to page 1 unless the change names a page. */
function buildSearch(current: ListParams, patch: Partial<ListParams>): string {
  const next = { ...current, ...patch };
  if (!("page" in patch)) next.page = 1;
  const params = new URLSearchParams();
  if (next.page > 1) params.set("page", String(next.page));
  if (next.difficulty) params.set("difficulty", next.difficulty);
  if (next.category) params.set("category", next.category);
  if (next.tag) params.set("tag", next.tag);
  if (next.view === "infinite") params.set("view", "infinite");
  if (next.search.trim()) params.set("search", next.search.trim());
  const text = params.toString();
  return text ? `?${text}` : "";
}

export function useListParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = readParams(searchParams);
  const { page, difficulty, search, category, tag, view } = params;

  // `to` and `change` are the same function between renders until the page, the difficulty or the search changes.
  // A memoised child (Pagination) that receives one of them can then skip a render; a new function each time would defeat memo.

  /** Where a link goes after this change (for pagination links and "clear filters"). */
  const to = useCallback((patch: Partial<ListParams>): To => ({ search: buildSearch({ page, difficulty, search, category, tag, view }, patch) }), [page, difficulty, search, category, tag, view]);
  /** Apply a change now. `replace` rewrites the current history entry (use it while typing, so Back is not full of half-typed searches). The scroll position stays (preventScrollReset). */
  const change = useCallback(
    (patch: Partial<ListParams>, options?: { replace?: boolean }) => setSearchParams(buildSearch({ page, difficulty, search, category, tag, view }, patch), { ...options, preventScrollReset: true }),
    [page, difficulty, search, category, tag, view, setSearchParams],
  );

  return { ...params, to, change };
}
