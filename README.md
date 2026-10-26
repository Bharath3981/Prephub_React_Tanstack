# PrepHub React + TanStack

The second React version of PrepHub: the same pages and API as `Prephub_React`, but server data is handled by
**TanStack Query v5** (cache, de-duplication, retries, prefetching, mutations). React 19, TypeScript (strict), Tailwind v4, Vite.

## Run

```bash
yarn install
yarn dev        # http://localhost:5176
yarn build      # type-check, then build to dist/
yarn typecheck
```

`/api/*` is proxied to the PrepHub API on `http://localhost:5001` (start it from the Prephub repository with `yarn api:dev`).

Plan and progress: `docs/PROGRESS.md`. Comparison with the pure-React app: `docs/COMPARISON.md`.
