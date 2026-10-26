# PrepHub React + TanStack

The second React version of PrepHub (the first is `../Prephub_React`, written by hand with `useFetch`). Same pages, same API;
the difference is that all server data goes through **TanStack Query v5**, so the two apps can be compared step by step.
Plan, steps and covered interview questions: [docs/PROGRESS.md](docs/PROGRESS.md) (keep it updated).
Measured differences between the two apps: [docs/COMPARISON.md](docs/COMPARISON.md).

## Working mode

The owner is learning while building. For each step: explain the concept briefly, build it in small runnable pieces, check it in
the browser, and say which interview questions (numbers from `../Prephub/docs/REACT-INTERVIEW-QUESTIONS.md`) it covers.
Commit only when the owner says so, and only the files they name.

## Stack and conventions

- The project lives in the repository root (no subfolder). Own `package.json` and `yarn.lock`; use `yarn`, never npm.
- 100% TypeScript, strict mode. ES module syntax, never `require`. Pin `typescript` and `@types/node` to exact versions.
- Vite 6, React 19, React Router 7 (data router), Tailwind v4 (tokens in `src/index.css`), zod for response checking.
- Server data: TanStack Query only (no hand-written fetch state). UI state: `useState`, context or the URL.
- `/api/*` is proxied to the PrepHub API on port 5001. Dev server: `yarn dev` on port 5176 (the pure-React app uses 5175).
- Node is 22.13.1; some packages want >=22.15, so `.yarnrc` has `--install.ignore-engines true`.

## Layout

```
src/
  app/       router, layouts (header, footer), pages, error boundaries
  features/  one folder per area (catalog, browse, admin ...), added step by step
  shared/    ui/ hooks/ lib/ api/ (client, parse, query-client) dev/ (render counter, Query DevTools)
```
