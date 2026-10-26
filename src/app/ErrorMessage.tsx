import type { ReactNode } from "react";
import { Button } from "@/shared/ui/Button";

/** The friendly error screen used by the global boundary and by the router. Details are shown in development only. */
export function ErrorMessage({ title = "Something went wrong", error, onRetry, children }: { title?: string; error?: unknown; onRetry?: () => void; children?: ReactNode }) {
  const detail = error instanceof Error ? error.message : error ? String(error) : undefined;
  return (
    <div role="alert" className="mx-auto my-16 max-w-xl rounded-xl border border-border bg-surface p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-muted">An unexpected error stopped this part of the page. You can try again, or go back to the home page.</p>
      {import.meta.env.DEV && detail && <pre className="mt-3 overflow-x-auto rounded-md bg-surface-2 p-3 text-sm">{detail}</pre>}
      {children}
      <div className="mt-4 flex gap-2">
        {onRetry && <Button onClick={onRetry}>Try again</Button>}
        {/* A plain link on purpose: a full page load also clears any broken state in the app. */}
        <a href="/" className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-surface-2">
          Home
        </a>
      </div>
    </div>
  );
}
