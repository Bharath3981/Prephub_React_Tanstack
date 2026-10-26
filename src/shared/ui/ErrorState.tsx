import { ApiRequestError } from "@/shared/api/client";
import { Button } from "@/shared/ui/Button";

/**
 * An error inside a page (for example a request failed). The rest of the page stays on screen.
 * Different from the full-screen boundary message in src/app/ErrorMessage.tsx, which is for crashes.
 */
export function ErrorState({ error, onRetry, title = "Could not load this" }: { error: Error; onRetry?: () => void; title?: string }) {
  const api = error instanceof ApiRequestError ? error : null;
  const message = api?.status === 0 && api.code === "NETWORK" ? "The server cannot be reached. Check that the API is running." : error.message;

  return (
    <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft p-5">
      <h3 className="font-semibold text-danger">{title}</h3>
      <p className="mt-1 text-sm">{message}</p>
      {api?.requestId && <p className="mt-1 text-xs text-muted">Reference: {api.requestId}</p>}
      {onRetry && (
        <Button className="mt-3" variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
