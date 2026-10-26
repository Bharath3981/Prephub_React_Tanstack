import { useCallback, useRef, type ReactNode } from "react";
import { Link, type To } from "react-router";
import { EntryRow } from "@/features/catalog/EntryRow";
import type { EntriesPage } from "@/features/catalog/types";
import { useScrollIntoViewOnChange } from "@/shared/hooks/useScrollIntoViewOnChange";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Pagination } from "@/shared/ui/Pagination";
import { Skeleton } from "@/shared/ui/Skeleton";

/** Grey placeholder cards shown the very first time a list loads (before there is any list to show). */
export function EntryListSkeleton() {
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

/** What a list page needs from its query. A page passes the fields of its `useQuery` result (or of a part of it). */
export interface ListState {
  data: EntriesPage | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  /** True while the previous page is shown in place of the one that is loading. */
  isPlaceholderData: boolean;
  refetch: () => unknown;
}

interface Props {
  state: ListState;
  /** Builds the URL of a page with the current filters kept. Pass the same function until the URL changes (it is given to a memoised pager). */
  pageLink: (page: number) => To;
  /** Where "Clear the filters" goes. Leave it out when the list has no filters. */
  clearTo?: To;
  filtered?: boolean;
  /** Shown when the list is empty and no filter is on. */
  emptyText: string;
  /** Maps a category slug to its name; when given, each card shows its topic (used by lists that mix topics). */
  topicName?: (categorySlug: string) => string | undefined;
  /** The filter bar. It sits inside the scroll anchor, so a page change scrolls back up to it. */
  filters?: ReactNode;
}

/**
 * The part every PAGED list page shares: filter bar slot, "Showing 1 to 20 of 45", loading / error / empty / cards, and the pager.
 * SectionPage, QuestionsPage and TagPage differ only in WHICH query they make and which filters they put in the slot.
 */
export function EntryResults({ state, pageLink, clearTo, filtered = false, emptyText, topicName, filters }: Props) {
  const list = state.data?.entries;
  const meta = state.data?.meta;

  const listTop = useRef<HTMLDivElement>(null);
  useScrollIntoViewOnChange(listTop, meta?.page);

  // A stable function for the memoised Pagination.
  const link = useCallback((page: number) => pageLink(page), [pageLink]);

  return (
    <>
      <div ref={listTop} className="scroll-mt-20 space-y-2">
        {filters}
        {meta && list && list.length > 0 && (
          <p className="text-sm text-muted" aria-live="polite">
            Showing {(meta.page - 1) * meta.limit + 1} to {(meta.page - 1) * meta.limit + list.length} of {meta.total}
          </p>
        )}
      </div>

      {state.isError && !state.data && <ErrorState title="Could not load the entries" error={state.error!} onRetry={() => void state.refetch()} />}
      {state.isPending && <EntryListSkeleton />}

      {list && meta && (
        <div aria-busy={state.isPlaceholderData} className={state.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
          {list.length === 0 ? (
            <p className="text-muted">
              {meta.page > 1 && meta.total > 0 ? (
                <>
                  There is no page {meta.page}.{" "}
                  <Link to={pageLink(1)} preventScrollReset className="text-accent underline">
                    Go to the first page
                  </Link>
                  .
                </>
              ) : filtered && clearTo ? (
                <>
                  No entries match these filters.{" "}
                  <Link to={clearTo} preventScrollReset className="text-accent underline">
                    Clear the filters
                  </Link>
                </>
              ) : (
                emptyText
              )}
            </p>
          ) : (
            <ul className="space-y-3">
              {list.map((entry) => (
                <EntryRow key={`${entry.categorySlug}/${entry.sectionSlug}/${entry.slug}`} entry={entry} topic={topicName?.(entry.categorySlug)} />
              ))}
            </ul>
          )}
        </div>
      )}

      {meta && <Pagination page={meta.page} totalPages={meta.totalPages} to={link} />}
    </>
  );
}
