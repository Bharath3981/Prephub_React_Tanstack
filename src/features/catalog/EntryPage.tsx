import { QueryErrorResetBoundary, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { useOutletContext, useParams } from "react-router";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import { NotFoundPage } from "@/app/pages/NotFoundPage";
import { EntryBody } from "@/features/catalog/EntryBody";
import { EntryExtras } from "@/features/catalog/EntryExtras";
import { EntryPager } from "@/features/catalog/EntryPager";
import { entryDetailQuery, findCachedEntrySummary } from "@/features/catalog/queries";
import type { SectionContext } from "@/features/catalog/SectionLayout";
import type { EntryDetail, EntrySummary } from "@/features/catalog/types";
import { isNotFound } from "@/shared/api/not-found";
import { useRenderCount } from "@/shared/dev/render-count";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { usesCodeEditor } from "@/shared/lib/playground-link";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { DifficultyBadge } from "@/shared/ui/DifficultyBadge";
import { ErrorState } from "@/shared/ui/ErrorState";
import { KindBadge } from "@/shared/ui/KindBadge";
import { Skeleton } from "@/shared/ui/Skeleton";

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

function BodySkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-3">
      <span className="sr-only">Loading the entry...</span>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

function FullSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <span className="sr-only">Loading the entry...</span>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-5 w-32 rounded-full" />
      <Skeleton className="h-9 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

/**
 * The page layout, drawn from whatever we have: a list row only (`preview`, while loading) or the full entry (`entry`).
 *
 *   1. HEADER   breadcrumbs, kind and difficulty, title, reading time and date
 *   2. SUMMARY  the short answer
 *   3. BODY     the full answer: HTML from the API, sanitised first
 *   4. EXTRAS   follow-up questions, tags as links, related entries
 *   5. PAGER    previous and next entry, in the order of the side panel
 */
function EntryView({ preview, entry }: { preview: EntrySummary; entry?: EntryDetail }) {
  const { category, section, entryOrder } = useOutletContext<SectionContext>();
  useDocumentTitle(preview.title);
  return (
    <article className="space-y-6">
      <header className="space-y-3">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: category.name, to: `/${category.slug}` }, { label: section.name, to: `/${category.slug}/${section.slug}` }, { label: preview.title }]} />
        <div className="flex flex-wrap items-center gap-2">
          <KindBadge kind={preview.kind} />
          {preview.difficulty && <DifficultyBadge difficulty={preview.difficulty} />}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{preview.title}</h1>
        {entry && (
          <p className="text-sm text-muted">
            {entry.meta.readingMinutes !== undefined && <>{entry.meta.readingMinutes} min read · </>}
            Updated <time dateTime={entry.updatedAt}>{dateFormat.format(new Date(entry.updatedAt))}</time>
          </p>
        )}
      </header>

      {preview.summary && <p className="max-w-3xl text-lg text-muted">{preview.summary}</p>}

      {entry ? (
        <>
          <EntryBody html={entry.bodyHtml} editor={usesCodeEditor(category.slug, section.slug)} />
          <EntryExtras entry={entry} />
          <EntryPager categorySlug={category.slug} sectionSlug={section.slug} order={entryOrder} current={entry.slug} />
        </>
      ) : (
        <BodySkeleton />
      )}
    </article>
  );
}

/**
 * The part that WAITS for the entry. `useSuspenseQuery` never returns "pending": if there is no data it SUSPENDS (React shows
 * the nearest <Suspense> fallback), and if the request fails it THROWS (the nearest error boundary shows the error).
 * So this component can be written as if `entry` always exists: no isPending, no isError, no `entry?.`.
 */
function EntryContent({ categorySlug, sectionSlug, slug }: { categorySlug: string; sectionSlug: string; slug: string }) {
  const { data: entry } = useSuspenseQuery(entryDetailQuery(categorySlug, sectionSlug, slug));
  return <EntryView preview={entry} entry={entry} />;
}

/**
 * ENTRY PAGE: /:category/:section/:entry, for example /react/interview-questions/react-fiber-architecture
 *
 * Three layers, from outside in:
 *   QueryErrorResetBoundary + ErrorBoundary   a failed request shows the error with "Try again" (a 404 shows the not-found page)
 *   Suspense                                  while the entry loads: the list row from the cache (title, badges, summary) and a body skeleton
 *   EntryContent                              the entry itself, written without any loading or error code
 */
export function EntryPage() {
  useRenderCount("EntryPage");
  const { category, section } = useOutletContext<SectionContext>();
  const { entry: slug = "" } = useParams();
  const queryClient = useQueryClient();

  // Read when the fallback is needed: the list row, if the visitor came from a list (or the side panel loaded it).
  const preview = findCachedEntrySummary(queryClient, category.slug, section.slug, slug);

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          resetKeys={[category.slug, section.slug, slug]}
          fallback={(error, retry) =>
            isNotFound(error) ? (
              <NotFoundPage />
            ) : (
              <ErrorState
                title="Could not load this entry"
                error={error}
                onRetry={() => {
                  reset(); // tell Query to forget the failed state, then let the boundary render the children again
                  retry();
                }}
              />
            )
          }
        >
          <Suspense fallback={preview ? <EntryView preview={preview} /> : <FullSkeleton />}>
            <EntryContent categorySlug={category.slug} sectionSlug={section.slug} slug={slug} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
