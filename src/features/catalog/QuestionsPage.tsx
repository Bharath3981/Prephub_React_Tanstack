import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router";
import { EntryFilters } from "@/features/catalog/EntryFilters";
import { EntryResults, EntryListSkeleton } from "@/features/catalog/EntryResults";
import { EntryRow } from "@/features/catalog/EntryRow";
import { PAGE_SIZE, useListParams } from "@/features/catalog/list-params";
import { categoryQueries, questionQueries } from "@/features/catalog/queries";
import { TopicSelect } from "@/features/catalog/TopicSelect";
import { usePrefetchNextPage } from "@/features/catalog/usePrefetchNextPage";
import { VirtualEntryList } from "@/features/catalog/VirtualEntryList";
import { useRenderCount } from "@/shared/dev/render-count";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useInView } from "@/shared/hooks/useInView";
import { cn } from "@/shared/lib/cn";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { Button, buttonClass } from "@/shared/ui/Button";
import { ErrorState } from "@/shared/ui/ErrorState";

/**
 * QUESTIONS PAGE: /questions. Every question of every topic, filtered by topic, difficulty and search text.
 * Filters live in the URL (/questions?category=react&difficulty=HARD&search=hooks&page=2), like the section page.
 *
 * Two views of the same data (`?view=infinite` for the second):
 *   Numbered pages   one query per page (useQuery), a pager, the previous page stays on screen while the next loads
 *   Infinite list    ONE query that grows (useInfiniteQuery): "Load more" or scroll, optionally a virtualised list
 */
export function QuestionsPage() {
  useRenderCount("QuestionsPage");
  useDocumentTitle("Questions");
  const { view, to } = useListParams();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Questions" }]} />
        <h1 className="text-3xl font-bold tracking-tight">Questions</h1>
        <p className="max-w-2xl text-muted">Every interview question from every topic. Pick a topic, a difficulty, or search.</p>
        <nav aria-label="View" className="flex gap-2 pt-1">
          {(["pages", "infinite"] as const).map((option) => (
            <Link
              key={option}
              to={to({ view: option, page: 1 })}
              preventScrollReset
              aria-current={view === option ? "true" : undefined}
              className={cn(buttonClass(view === option ? "primary" : "secondary", "sm"))}
            >
              {option === "pages" ? "Numbered pages" : "Infinite list"}
            </Link>
          ))}
        </nav>
      </header>
      {view === "infinite" ? <InfiniteQuestions /> : <PagedQuestions />}
    </div>
  );
}

/** The topic select and the filter bar, shared by both views. */
function useQuestionFilters() {
  const { difficulty, search, category, change } = useListParams();
  // The topic names for the select and for the label on each card. Same key as the Home page: from the cache if Home was visited.
  const topics = useQuery(categoryQueries.list());
  const topicList = useMemo(() => topics.data ?? [], [topics.data]);
  const topicName = useCallback((slug: string) => topicList.find((topic) => topic.slug === slug)?.name, [topicList]);

  const filters = (
    <div className="space-y-3">
      <TopicSelect topics={topicList} value={category} onChange={(value) => change({ category: value })} />
      <EntryFilters
        difficulty={difficulty}
        search={search}
        searchLabel="Search all questions"
        onDifficulty={(value) => change({ difficulty: value })}
        onSearch={(value) => change({ search: value }, { replace: true })}
      />
    </div>
  );
  return { filters, topicName };
}

function PagedQuestions() {
  const { page, difficulty, search, category, to } = useListParams();
  const { filters, topicName } = useQuestionFilters();
  const pageLink = useCallback((next: number) => to({ page: next }), [to]);
  const clearLink = useMemo(() => to({ difficulty: undefined, search: "", category: undefined }), [to]);
  const params = { page, limit: PAGE_SIZE, difficulty, search, category };

  // One list of every topic: the previous page can stay on screen (dimmed) while the next loads.
  const questions = useQuery({ ...questionQueries.list(params), placeholderData: keepPreviousData });

  usePrefetchNextPage({
    page,
    totalPages: questions.data?.meta.totalPages ?? 0,
    isPlaceholder: questions.isPlaceholderData,
    keyParts: [difficulty, search, category],
    prefetch: (client, next) => client.prefetchQuery(questionQueries.list({ ...params, page: next })),
  });

  return (
    <EntryResults
      state={questions}
      pageLink={pageLink}
      clearTo={clearLink}
      filtered={difficulty !== undefined || search.trim() !== "" || category !== undefined}
      emptyText="There are no published questions yet."
      topicName={topicName}
      filters={filters}
    />
  );
}

function InfiniteQuestions() {
  useRenderCount("InfiniteQuestions");
  const { difficulty, search, category, to } = useListParams();
  const { filters, topicName } = useQuestionFilters();
  const [virtualised, setVirtualised] = useState(true);

  // The filters are in the key; the page is not. Changing a filter is a NEW query (it starts from page 1 again).
  const feed = useInfiniteQuery(questionQueries.feed({ limit: PAGE_SIZE, difficulty, search, category }));
  const entries = useMemo(() => feed.data?.pages.flatMap((page) => page.entries) ?? [], [feed.data]);
  const total = feed.data?.pages[0]?.meta.total ?? 0;

  // The sentinel is an empty box under the list. When it comes near the screen, the next page is requested.
  // Not while a page is already loading (it would ask twice), and not when the last page is loaded.
  const loadNext = () => void feed.fetchNextPage();
  const sentinel = useInView<HTMLDivElement>(loadNext, { enabled: feed.hasNextPage && !feed.isFetchingNextPage && !feed.isFetchNextPageError });

  const filtered = difficulty !== undefined || search.trim() !== "" || category !== undefined;

  return (
    <>
      <div className="space-y-2">
        {filters}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={virtualised} onChange={(event) => setVirtualised(event.target.checked)} />
          Virtualise the list (render only the rows near the screen)
        </label>
        {feed.data && (
          <p className="text-sm text-muted" aria-live="polite">
            Loaded {entries.length} of {total}
          </p>
        )}
      </div>

      {feed.isError && !feed.data && <ErrorState title="Could not load the questions" error={feed.error} onRetry={() => void feed.refetch()} />}
      {feed.isPending && <EntryListSkeleton />}

      {feed.data &&
        (entries.length === 0 ? (
          <p className="text-muted">
            {filtered ? (
              <>
                No questions match these filters.{" "}
                <Link to={to({ difficulty: undefined, search: "", category: undefined })} preventScrollReset className="text-accent underline">
                  Clear the filters
                </Link>
              </>
            ) : (
              "There are no published questions yet."
            )}
          </p>
        ) : virtualised ? (
          <VirtualEntryList entries={entries} topicName={topicName} />
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <EntryRow key={`${entry.categorySlug}/${entry.sectionSlug}/${entry.slug}`} entry={entry} topic={topicName(entry.categorySlug)} />
            ))}
          </ul>
        ))}

      {feed.isFetchNextPageError && (
        <p role="alert" className="text-sm text-danger">
          Could not load more questions.{" "}
          <button className="underline" onClick={loadNext}>
            Try again
          </button>
        </p>
      )}

      {feed.data && (
        <div ref={sentinel} className="flex min-h-12 items-center justify-center">
          {feed.isFetchingNextPage ? (
            <span role="status" className="text-sm text-muted">
              Loading more...
            </span>
          ) : feed.hasNextPage ? (
            <Button variant="secondary" onClick={loadNext}>
              Load more
            </Button>
          ) : entries.length > 0 ? (
            <span className="text-sm text-muted">That is every question.</span>
          ) : null}
        </div>
      )}
    </>
  );
}
