import { useQuery } from "@tanstack/react-query";
import { CategoryCard } from "@/features/catalog/CategoryCard";
import { categoryQueries } from "@/features/catalog/queries";
import { useRenderCount } from "@/shared/dev/render-count";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Skeleton } from "@/shared/ui/Skeleton";

function CategoryGridSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading topics...</span>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="space-y-3 rounded-xl border border-border bg-surface p-5">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * HOME: the list of topics.
 *
 * Compare with the pure-React version: there is no useState for data, loading and error, no useEffect, no AbortController,
 * no `reload` counter. `useQuery` gives all of it, and the data lives in the shared cache, not in this component.
 *
 * The three things to read from the result:
 *   isPending    there is NO data yet (the very first load)            -> show the skeleton
 *   isError      the request failed (after the retries)                -> show the error with "Try again"
 *   isFetching   a request is running RIGHT NOW, even if data is shown -> a small "Updating..." hint (background refresh)
 * `isPending` and `isFetching` are different: when you come back to Home, the cached topics are shown at once (not pending)
 * and, if they are older than staleTime, a refresh runs in the background (fetching).
 */
export function HomePage() {
  useRenderCount("HomePage");
  useDocumentTitle();
  const categories = useQuery(categoryQueries.list());
  console.log("HomePage render", categories);
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">Interview preparation, one concept at a time</h1>
        <p className="mt-2 max-w-2xl text-muted">Pick a topic to read concepts, practise interview questions and see real examples.</p>
      </section>

      <section aria-labelledby="topics-heading">
        <div className="flex items-center gap-3">
          <h2 id="topics-heading" className="text-xl font-semibold">
            Topics
          </h2>
          {/* Shown only while old data is on screen and a refresh runs behind it. */}
          {categories.isFetching && !categories.isPending && (
            <span role="status" className="text-sm text-muted">
              Updating...
            </span>
          )}
        </div>
        <div className="mt-4">
          {categories.isPending && <CategoryGridSkeleton />}

          {/* No data and the request failed: nothing to show, so the error takes the place of the list. */}
          {categories.isError && !categories.data && <ErrorState title="Could not load the topics" error={categories.error} onRetry={() => void categories.refetch()} />}

          {/* A background refresh failed but we still hold the old topics: keep showing them, with a small notice. */}
          {categories.isError && categories.data && (
            <p role="alert" className="mb-4 text-sm text-danger">
              Could not refresh the topics, showing the saved ones.{" "}
              <button className="underline" onClick={() => void categories.refetch()}>
                Try again
              </button>
            </p>
          )}

          {categories.data &&
            (categories.data.length === 0 ? (
              <p className="text-muted">No topics have been published yet.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.data.map((category) => (
                  <CategoryCard key={category.slug} category={category} />
                ))}
              </ul>
            ))}
        </div>
      </section>
    </div>
  );
}
