import { lazy, Suspense } from "react";

/**
 * The TanStack Query DevTools: a floating panel that lists every query in the cache with its key, status (fresh, stale,
 * fetching, inactive), data and observers. It is loaded ONLY in development and on demand (React.lazy), and the
 * `import.meta.env.DEV` check lets the production build drop it completely.
 */
const Devtools = import.meta.env.DEV
  ? lazy(() => import("@tanstack/react-query-devtools").then((module) => ({ default: module.ReactQueryDevtools })))
  : null;

export function QueryDevtools() {
  if (!Devtools) return null;
  return (
    <Suspense fallback={null}>
      <Devtools initialIsOpen={false} buttonPosition="bottom-left" />
    </Suspense>
  );
}
