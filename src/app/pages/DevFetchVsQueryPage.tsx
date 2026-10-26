import { useEffect, useState, useSyncExternalStore } from "react";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { getCategories } from "@/features/catalog/api";
import type { DeliveryCategory } from "@/features/catalog/types";
import { Button } from "@/shared/ui/Button";

/**
 * Development only: the SAME list of topics loaded two ways, with two copies of each on the page, to count requests.
 *
 *   Left   useState + useEffect + fetch  (what you write without a library)
 *   Right  useQuery                       (TanStack Query)
 *
 * "Show again" unmounts and mounts all four components again, like leaving a page and coming back.
 */

// --- a tiny counter of requests, readable from React ------------------------------------------------------------
type Counts = { effect: number; query: number };
let counts: Counts = { effect: 0, query: 0 };
const listeners = new Set<() => void>();
function count(kind: keyof Counts) {
  counts = { ...counts, [kind]: counts[kind] + 1 };
  listeners.forEach((listener) => listener());
}
const useCounts = () =>
  useSyncExternalStore(
    (listener) => (listeners.add(listener), () => void listeners.delete(listener)),
    () => counts,
  );

// --- left: the plain useEffect version --------------------------------------------------------------------------
function EffectList({ label }: { label: string }) {
  const [data, setData] = useState<DeliveryCategory[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    count("effect");
    // No AbortController, no cache, no sharing: every component that mounts sends its own request.
    getCategories().then(setData, (e: Error) => setError(e));
  }, []);

  return <Box label={label} loading={!data && !error} error={error} total={data?.length} />;
}

// --- right: the useQuery version --------------------------------------------------------------------------------
// A key of its own (not the Home page's), so the first visit really has to fetch.
const demoQuery = queryOptions({
  queryKey: ["dev", "fetch-vs-query", "categories"],
  queryFn: ({ signal }) => {
    count("query");
    return getCategories(signal);
  },
});

function QueryList({ label }: { label: string }) {
  const { data, error, isPending } = useQuery(demoQuery);
  return <Box label={label} loading={isPending} error={error} total={data?.length} />;
}

function Box({ label, loading, error, total }: { label: string; loading: boolean; error: Error | null; total: number | undefined }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3 text-sm">
      <b>{label}</b>: {loading ? "loading..." : error ? `error: ${error.message}` : `${total} topics`}
    </div>
  );
}

export function DevFetchVsQueryPage() {
  const [round, setRound] = useState(1);
  const { effect, query } = useCounts();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">useEffect fetch vs useQuery</h1>
        <p className="max-w-2xl text-muted">
          Two components on each side ask for the same topics. Press <b>Show again</b> to leave and come back (round {round}). Strict Mode is on, so in development every effect also runs twice.
        </p>
        <Button onClick={() => setRound((n) => n + 1)}>Show again</Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-label="useEffect" className="space-y-3">
          <h2 className="text-lg font-semibold">
            useEffect + fetch: <span data-testid="effect-count">{effect}</span> requests
          </h2>
          <div key={`effect-${round}`} className="space-y-2">
            <EffectList label="Component A" />
            <EffectList label="Component B" />
          </div>
          <p className="text-sm text-muted">No sharing and no cache: every mount sends a request, nothing is cancelled, and a slow old answer could overwrite a newer one.</p>
        </section>

        <section aria-label="useQuery" className="space-y-3">
          <h2 className="text-lg font-semibold">
            useQuery: <span data-testid="query-count">{query}</span> requests
          </h2>
          <div key={`query-${round}`} className="space-y-2">
            <QueryList label="Component A" />
            <QueryList label="Component B" />
          </div>
          <p className="text-sm text-muted">Both components subscribe to one cache entry: one request, then the data is served from the cache while it is fresh.</p>
        </section>
      </div>
    </div>
  );
}
