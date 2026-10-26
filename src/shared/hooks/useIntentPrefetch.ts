import { useQueryClient, type QueryClient } from "@tanstack/react-query";

/**
 * "Prefetch on intent": start loading a page's data when the visitor HOVERS or FOCUSES its link, before the click.
 * The few hundred milliseconds between the pointer arriving and the click are enough for the request to finish, so
 * the next page opens already filled. If the data is already cached and fresh (staleTime), prefetchQuery sends nothing,
 * so hovering the same link ten times costs one request.
 *
 *   const intent = useIntentPrefetch((client) => client.prefetchQuery(categoryQueries.detail(slug)));
 *   <Link {...intent} to=...>
 */
export function useIntentPrefetch(prefetch: (client: QueryClient) => unknown) {
  const queryClient = useQueryClient();
  const run = () => void prefetch(queryClient);
  return { onPointerEnter: run, onFocus: run };
}
