# Progress

The plan: the same app as `../Prephub_React`, with TanStack Query for all server data, then auth and admin, then the labs.
Question numbers (#1 to #62) are from `../Prephub/docs/REACT-INTERVIEW-QUESTIONS.md`. T1 to T24 are TanStack-specific questions
that are added to that list when their phase is done. Each question is counted once, in the phase where it fits best.

## M0 Foundation: done

- [x] 0.1 Scaffold in the repository root (no subfolder): Vite 6, React 19.3, TypeScript strict (5.8.3 pinned), yarn, `@` alias, port 5176 with the `/api` proxy to 5001, `.yarnrc` for the engine mismatch (Node 22.13.1), `CLAUDE.md`, `README.md`. Versions are the same as the pure-React app (the lockfile was copied first), plus `@tanstack/react-query` and its DevTools, both pinned to 5.104.5.
- [x] 0.2 Tailwind v4 tokens (colours, dark mode through `data-theme`), UI primitives: `Button` and `buttonClass`, `Badge`, `Container`, `Skeleton`, `cn`, `ErrorState`
- [x] 0.3 Router (React Router 7, data router), `RootLayout` with header, footer and `<Outlet />`, 404 page, placeholder pages for the next modules
- [x] 0.4 Theme toggle: external store plus `useSyncExternalStore`, Light, Dark and System, applied before first paint
- [x] 0.5 Error boundaries: a global class boundary (in `main.tsx`) and two router `errorElement`s (layout level and page level); `/dev/boom` crashes on purpose
- [x] 0.6 API client (`api()`, `ApiRequestError`, query strings, abort, cookies) and zod `parseResponse`. The silent token refresh is added with the login (M7).
- [x] 0.7 `QueryClient` with defaults (`staleTime` 60 s, `gcTime` 5 min, no retry on 4xx and at most 2 retries otherwise, refetch on window focus), `QueryClientProvider`, Query DevTools (development only, loaded lazily)
- [x] 0.8 Dev render counter (`useRenderCount`, `window.__renders`, the corner panel) and `docs/COMPARISON.md`

Checked in the browser: the theme cycles Light, Dark, System, is saved, and 3 toggles caused **0 extra renders** (`RootLayout`, `Header`, `PlaceholderPage` stayed at 1); `/dev/boom` shows the error message with the header and footer still on screen; unknown URLs show the 404 page; titles are set per page; the API client returns data (13 categories through the proxy), throws `ApiRequestError` (status 404, code, request id) and supports abort; the `QueryClient` retry rule gives `false` for 404, `true` for a first 500 and for a network failure, `false` after 2 tries, and a real 404 query ran exactly once.

Concepts covered: JSX and composition, props and `children`, props vs state, synthetic events (the toggle handler), function components, rules of hooks (every hook is called at the top of a component), prop drilling avoided with composition, routing and nested layouts, `useSyncExternalStore`, theming without re-renders, error boundaries, project structure, QueryClient defaults.

**Questions covered in M0: 11 (running total 11 of 62):** #32, #33, #34, #35, #36, #28, #43, #25, #9, #16, #42. TanStack: T23.

## Next

| Module | Steps | Questions (new) | Total after |
|---|---|---|---|
| [ ] M1 Home page and the first query | 1.1 key factory and `queryOptions`, 1.2 `useQuery` on Home, 1.3 `staleTime` and `gcTime` experiments, 1.4 retry, focus and reconnect, 1.5 `useFetch` vs `useQuery` side by side, 1.6 measure | #17, #23, #5, #6, #7, #14, #56, #41 (8), T1 to T5, T22 | 19 |
| [ ] M2 Category, section and list | 2.1 category with 404, 2.2 section layout and URL state, 2.3 `keepPreviousData` paging, 2.4 debounced search, 2.5 shared panel query and `select`, 2.6 prefetch on hover, 2.7 memo and render budget, 2.8 keys and stale closure, 2.9 measure | #24, #12, #46, #19, #11, #2, #10, #53, #15 (9), T6 to T8 | 28 |
| [ ] M3 Entry page | 3.1 entry from the list cache, 3.2 safe HTML and lazy code editor, 3.3 `useSuspenseQuery`, 3.4 related and prefetch, 3.5 route polish, 3.6 tests start, 3.7 `useTransition` and `use`, 3.8 measure | #21, #26, #27, #31, #8 (5), T11, T24 | 33 |
| [ ] M4 Questions and tags | 4.1 `/questions`, 4.2 `useInfiniteQuery`, 4.3 TanStack Virtual, 4.4 `/tags`, 4.5 `/tags/:tag`, 4.6 measure | #47, #22 (2), T9, T19 | 35 |
| [ ] M5 Search | 5.1 `enabled` search, 5.2 safe snippets, 5.3 `useDeferredValue` vs debounce, 5.4 profile and fix, 5.5 measure | #39, #4 (2), T10 | 37 |
| [ ] M6 Polish and quality | 6.1 loading, error and empty components, 6.2 accessibility, 6.3 performance budget, 6.4 Web Vitals, 6.5 cross-browser, 6.6 cache persistence, 6.7 refetch policies, 6.8 tests, 6.9 deploy | #20, #38, #40, #44, #45 (5), T14 to T16 | 42 |
| [ ] M7 Auth | 7.1 `me` query, 7.2 login and logout mutations, 7.3 token refresh, 7.4 route guards, 7.5 password pages, 7.6 header and tests | #29, #30 (2), T17 | 44 |
| [ ] M8 Admin | 8.1 layout, 8.2 dashboard, 8.3 CRUD and optimistic reorder, 8.4 TanStack Table, 8.5 entry editor with TanStack Form, 8.6 publish and delete, 8.7 tags, 8.8 users and roles, 8.9 settings, audit, jobs, account, 8.10 toasts, 8.11 virtualised audit table, 8.12 mutation tests | #54, #50, #37, #60, #13 (5), T12, T13, T18, T20 | 49 |
| [ ] M9 Labs | 9.1 timer, 9.2 OTP, 9.3 star rating, 9.4 fetch hook, 9.5 polyfills, 9.6 setState puzzles, 9.7 virtual DOM, 9.8 Fiber, 9.9 Context vs Zustand vs Redux, 9.10 Web Worker, 9.11 Server Components note, 9.12 micro-frontends note, 9.13 comparison write-up, 9.14 TanStack Router lab (optional) | #1, #3, #18, #48, #49, #51, #52, #55, #57, #58, #59, #61, #62 (13), T21 | 62 |

### TanStack questions (added to the master list as their phase is done)

T1 server state vs client state, why not fetch in `useEffect` · T2 `staleTime` vs `gcTime`, `isPending` vs `isFetching` · T3 query keys and key factories ·
T4 de-duplication and cancellation · T5 retries and error handling · T6 `placeholderData` vs `initialData` · T7 prefetching · T8 `select` and structural sharing ·
T9 infinite queries · T10 `enabled` and dependent queries · T11 `useSuspenseQuery` · T12 mutation lifecycle and optimistic updates · T13 `invalidateQueries` vs `setQueryData` vs refetch ·
T14 refetch triggers and polling · T15 persistence and hydration · T16 testing with Query · T17 auth with Query · T18 TanStack Table · T19 TanStack Virtual ·
T20 TanStack Form · T21 Query vs RTK Query vs SWR · T22 DevTools · T23 QueryClient defaults · T24 seeding the cache and `useQueries`.
