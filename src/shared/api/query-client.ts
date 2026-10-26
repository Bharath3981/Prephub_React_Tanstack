import { QueryClient } from "@tanstack/react-query";
import { ApiRequestError } from "@/shared/api/client";

/** A 4xx answer is a final answer (not found, not allowed, bad input): asking again would get the same one. */
const isClientError = (error: unknown) => error instanceof ApiRequestError && error.status >= 400 && error.status < 500;

/**
 * One QueryClient holds the cache of every query in the app. These are the DEFAULTS; a single query can override them.
 *
 *  staleTime   how long data counts as FRESH. Fresh data is served from the cache with no request at all.
 *              0 (the library default) means "stale at once": every new subscriber triggers a background refetch.
 *              PrepHub content changes rarely, so a minute is a good start.
 *  gcTime      how long data nobody is using stays in memory before it is thrown away (default 5 minutes).
 *  retry       how many times a failed request is repeated, with growing delays. A network blip or a 500 is worth another
 *              try; a 404 or 422 is not, so those are not retried.
 *  refetchOnWindowFocus   fresh-looking data is refreshed when the visitor comes back to the tab (only if it is stale).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
      refetchOnWindowFocus: true,
    },
  },
});
