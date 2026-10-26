import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";

/**
 * A QueryClient for ONE test. Never share the app's client between tests: its cache would leak from one test into the next.
 * retry: false  a failing request fails at once (the app's real rule waits 1 s and 2 s between tries, which would make tests slow)
 * gcTime: Infinity  the cache is not thrown away while a test runs
 */
export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity, staleTime: 60_000 } } });
}

/** Renders a page inside a fresh QueryClient and a memory router (so links and params work without a browser URL). */
export function renderPage(routes: RouteObject[] | ReactElement, { path = "/", client = createTestQueryClient() } = {}) {
  const tree = Array.isArray(routes) ? routes : [{ path: "*", element: routes }];
  const router = createMemoryRouter(tree, { initialEntries: [path] });
  const view = render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...view, client, router };
}
