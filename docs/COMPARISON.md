# Pure React (`Prephub_React`) vs TanStack Query (this app)

Filled in step by step: each module adds its measured rows. The same pages, the same API, the same browser.

| Scenario | Pure React (`useFetch`) | TanStack Query | Module |
|---|---|---|---|
| Home, leave, come back (requests on return) | 1 (every visit asks again, skeleton first) | **0**: cards at once from the cache (fresh for `staleTime` 60 s). In the pure app, Home to React to Home to React sent 3 requests; the category page is built in M2, so that exact route is measured then. | M1 |
| Two components using the same data (one page) | 2 requests (4 in development with Strict Mode) | **1** (one cache entry, both subscribe) | M1 |
| Dev Strict Mode, leave and come back (`/dev/fetch-vs-query`, 2 components per side) | 4 requests per round with a plain `useEffect` fetch (none cancelled, all four answers used) | **0** new requests per round | M1 |
| Dev Strict Mode, refetch of stale data on mount | 2 calls, 1 cancelled (`useFetch`) | 2 calls, 1 cancelled (Query cancels because `queryFn` uses the signal); a production build sends 1 | M1 |
| Clicking "Easy" on a section list: `EntryRow` renders | 29 (after `memo`) | **9** (only the 9 new rows: `placeholderData` keeps the old rows, `memo` skips them) | M2 |
| Back to a page already visited | skeleton, then data | data at once; if older than `staleTime`, "Updating..." while a background request runs, no skeleton | M1 |
| A request fails with a 500 | no retry unless hand-written | 3 attempts, at 0 ms, 1 s and 3 s (back-off), then the error | M1 |
| A request fails with a 404 | 1 | 1 (the `retry` rule skips 4xx) | M1 |
| A background refresh fails while data is shown | list replaced by the error (or hand-written handling) | list stays, small notice with "Try again" (`isError` and `data` together) | M1 |
| Back to the browser tab after it was hidden | nothing | with `refetchOnWindowFocus: true`, stale data is refetched once; with `false` (current setting) nothing | M1 |
| Data nobody uses any more | stays in the component state until it unmounts | removed after `gcTime` (checked with 500 ms) | M1 |
| Renders of `HomePage` on load | 2 (skeleton, data) | 2 (skeleton, data) | M1 |
| Home, topic page, section page (requests at each click, no hover) | each click loads its data, skeleton first | the same on first visit; the topic is cached for the section page (same key): 0 for it | M2 |
| Same, after hovering each link first | n/a | click opens at once: the hover already loaded the topic (1 request), and the first list page and the panel (2 requests) | M2 |
| Section layout asks for the topic that the topic page just loaded | 1 more request | **0** (same query key, from the cache) | M2 |
| Going to page 2 | skeleton or dimmed list while it loads | **instant** (page 2 was prefetched while reading page 1); page 3 is then prefetched | M2 |
| Back to "All" after trying "Easy" | request again | **0** requests, instant (cached under its own key) | M2 |
| Typing 5 letters in the search box | 1 request after the pause | 1 request after the pause (the same `useDebouncedValue`) | M2 |
| `SectionNav` renders on a filter or page change | 0 (after `memo`) | 0 (`select` returns the same `groups` array, no `useMemo`) | M2 |
| Moving to another section while a list is on screen | scoped `useKeepPrevious` | scoped `placeholderData` function (plain `keepPreviousData` would show the old section's rows) | M2 |
| Lines of data-fetching code in `SectionPage` | `useFetch` + `useKeepPrevious` + effect | one `useQuery` with options | M2 |
| Opening an entry from a list | skeleton for the whole page, then everything | title, badges and summary at once (the list row from the cache), body skeleton, then the body | M3 |
| Revisiting an entry | request again | **0** requests, body at once | M3 |
| "Next" / "Previous" and panel links | load on click | the neighbours are prefetched after the page loads and the panel link on hover: body present 250 ms after the click, 0 waiting | M3 |
| Failed entry request | hand-written error state in the page | Suspense + error boundary: `EntryContent` has no loading or error code; "Try again" resets Query and the boundary; the side panel stays | M3 |
| Entry page renders per navigation | 2 (skeleton, data) | **1** (`EntryPage`; the waiting happens inside Suspense) | M3 |
| Tests | none yet (deferred in the pure app) | 18 tests (Vitest, Testing Library, msw), each with its own `QueryClient` | M3 |
| `/questions` first load (requests) | categories + page 1 (+ page 2 prefetch is added in this app) | 3: categories (topic names), page 1, page 2 prefetched | M4 |
| Home, then `/questions` (topic names) | requests the topics again | **0** for the names (same key as Home) | M4 |
| All 244 questions in one infinite list (requests) | 13 with a hand-made loader | 13, one per page, **0 duplicates** while scrolling (`useInView` plus `isFetchingNextPage`) | M4 |
| DOM after loading all 244 questions | 244 rows, 4579 DOM nodes | **9 rows, 614 nodes** with TanStack Virtual (the list box is still ~40,000 px tall, so the scroll bar is right) | M4 |
| Scrolled to the middle of the 244 | all rows exist | 19 rows exist (rows 114 to 132) | M4 |
| `/tags` | 1 request, list in the component | 1 request, `select` computes the cloud sizes once per data change | M4 |
| Tag chip hover, then click | page loads on click | hover starts the request; on click the 13 entries and the header are there within 200 ms, 0 requests on click | M4 |
| Tag page header | waits for its own request | drawn from the cached tags list (name and count) while the entries load | M4 |
| Unknown tag | 1 request, not-found page | 1 request, not-found page (4xx is not retried) | M4 |
| Tests | 18 | 28 (+ paged filters in the request, next-page prefetch, sentinel loading each page once, Load more, virtual and plain lists, tag header from cache, tag 404 with one request) | M4 |
