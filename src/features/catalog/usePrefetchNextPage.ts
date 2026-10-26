import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * While the visitor reads page N, quietly load page N+1, so "Next" shows it at once. prefetchQuery does nothing when that
 * page is already cached and fresh.
 *
 * `isPlaceholder` must be true while a dimmed PREVIOUS page is on screen: its page count belongs to the old filters, and a
 * prefetch based on it would be wasted (found with the request log in M2).
 *
 * `prefetch(client, page)` starts the request for page N+1 (the caller knows its own query). It is a new function on every render, so it is not a dependency of the effect:
 * `keyParts` (the filters that make up the key) are, so the effect runs again exactly when the next page would be a different query.
 */
export function usePrefetchNextPage({ page, totalPages, isPlaceholder, keyParts, prefetch }: { page: number; totalPages: number; isPlaceholder: boolean; keyParts: unknown[]; prefetch: (client: QueryClient, nextPage: number) => unknown }) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!isPlaceholder && page < totalPages) void prefetch(queryClient, page + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, page, totalPages, isPlaceholder, ...keyParts]);
}
