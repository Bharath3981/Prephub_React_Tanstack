import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { Link, useOutletContext } from "react-router";
import { EntryFilters } from "@/features/catalog/EntryFilters";
import { EntryRow } from "@/features/catalog/EntryRow";
import { PAGE_SIZE, useListParams } from "@/features/catalog/list-params";
import { entryQueries, keepPageInSection } from "@/features/catalog/queries";
import type { SectionContext } from "@/features/catalog/SectionLayout";
import { useRenderCount } from "@/shared/dev/render-count";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useScrollIntoViewOnChange } from "@/shared/hooks/useScrollIntoViewOnChange";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { ErrorState } from "@/shared/ui/ErrorState";
import { KindBadge } from "@/shared/ui/KindBadge";
import { Pagination } from "@/shared/ui/Pagination";
import { Skeleton } from "@/shared/ui/Skeleton";

/** Grey placeholder cards shown the very first time a list loads (before there is any list to show). */
function EntryListSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-3">
      <span className="sr-only">Loading entries...</span>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="space-y-3 rounded-xl border border-border bg-surface p-4">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * SECTION LIST PAGE: /:category/:section, for example /react/interview-questions
 *
 * Only the RIGHT-HAND part of the screen. The side panel belongs to SectionLayout (it stays mounted between entries).
 * Where the data comes from:
 *  - the topic and the section: SectionLayout, through the outlet context;
 *  - page, difficulty and search: the URL (list-params.ts), so a link or a refresh gives the same list;
 *  - the entries of this page: useQuery. The page and the filters are part of the key, so every combination is cached on its own.
 */
export function SectionPage() {
  useRenderCount("SectionPage");
  const { category, section } = useOutletContext<SectionContext>();
  const queryClient = useQueryClient();

  const { page, difficulty, search, to, change } = useListParams();
  const pageLink = useCallback((next: number) => to({ page: next }), [to]);
  const params = { page, limit: PAGE_SIZE, difficulty, search };

  // placeholderData keeps the current page on screen (dimmed) while the next one loads, instead of a skeleton.
  // It replaces the hand-written useKeepPrevious of the pure-React app.
  const entries = useQuery({ ...entryQueries.list(category.slug, section.slug, params), placeholderData: keepPageInSection(category.slug, section.slug) });
  const list = entries.data?.entries;
  const meta = entries.data?.meta;

  // The pager is at the bottom of the page, so after a page change the list's top is scrolled into view.
  const listTop = useRef<HTMLDivElement>(null);
  useScrollIntoViewOnChange(listTop, page);

  // Prefetch: while the visitor reads this page, the next one is fetched quietly, so "Next" shows it at once.
  // prefetchQuery does nothing when that page is already cached and fresh.
  // Not while the dimmed PREVIOUS page is shown (isPlaceholderData): its page count belongs to the old filters, and a prefetch based on it is wasted.
  const totalPages = meta?.totalPages ?? 0;
  const isPlaceholder = entries.isPlaceholderData;
  useEffect(() => {
    if (!isPlaceholder && page < totalPages) void queryClient.prefetchQuery(entryQueries.list(category.slug, section.slug, { page: page + 1, limit: PAGE_SIZE, difficulty, search }));
  }, [queryClient, category.slug, section.slug, page, totalPages, isPlaceholder, difficulty, search]);

  useDocumentTitle(`${section.name} · ${category.name}`);

  const filtered = difficulty !== undefined || search.trim() !== "";

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: category.name, to: `/${category.slug}` }, { label: section.name }]} />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{section.name}</h1>
          <KindBadge kind={section.kind} />
        </div>
        {section.description && <p className="max-w-2xl text-muted">{section.description}</p>}
      </header>

      <div ref={listTop} className="scroll-mt-20 space-y-2">
        <EntryFilters difficulty={difficulty} search={search} onDifficulty={(value) => change({ difficulty: value })} onSearch={(value) => change({ search: value }, { replace: true })} />
        {meta && list && list.length > 0 && (
          <p className="text-sm text-muted" aria-live="polite">
            Showing {(meta.page - 1) * meta.limit + 1} to {(meta.page - 1) * meta.limit + list.length} of {meta.total}
          </p>
        )}
      </div>

      {entries.isError && !entries.data && <ErrorState title="Could not load the entries" error={entries.error} onRetry={() => void entries.refetch()} />}
      {entries.isPending && <EntryListSkeleton />}

      {list && meta && (
        <div aria-busy={entries.isPlaceholderData} className={entries.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
          {list.length === 0 ? (
            <p className="text-muted">
              {meta.page > 1 && meta.total > 0 ? (
                <>
                  There is no page {meta.page}.{" "}
                  <Link to={to({ page: 1 })} preventScrollReset className="text-accent underline">
                    Go to the first page
                  </Link>
                  .
                </>
              ) : filtered ? (
                <>
                  No entries match these filters.{" "}
                  <Link to={to({ difficulty: undefined, search: "" })} preventScrollReset className="text-accent underline">
                    Clear the filters
                  </Link>
                </>
              ) : (
                "This section has no published entries yet."
              )}
            </p>
          ) : (
            <ul className="space-y-3">
              {list.map((entry) => (
                <EntryRow key={entry.slug} entry={entry} />
              ))}
            </ul>
          )}
        </div>
      )}

      {meta && <Pagination page={meta.page} totalPages={meta.totalPages} to={pageLink} />}
    </div>
  );
}
