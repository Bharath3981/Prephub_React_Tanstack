# Pure React (`Prephub_React`) vs TanStack Query (this app)

Filled in step by step: each module adds its measured rows. The same pages, the same API, the same browser.

| Scenario | Pure React (`useFetch`) | TanStack Query | Module |
|---|---|---|---|
| Home to React to Home to React (requests sent) | 3 | to measure | M1 |
| Two components using the same data | 2 requests | to measure | M2 |
| Dev Strict Mode on a page that loads two lists (requests, cancelled ones) | 4 (2 cancelled) | to measure | M1 |
| Clicking a difficulty filter: renders of `EntryRow` | 29 (after `memo`) | to measure | M2 |
| Back to a page already visited | skeleton, then data | to measure | M1 |
