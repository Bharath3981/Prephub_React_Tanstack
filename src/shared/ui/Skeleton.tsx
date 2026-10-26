import { cn } from "@/shared/lib/cn";

/** A grey pulsing placeholder shown while data loads. Size it with classes: <Skeleton className="h-4 w-40" />. */
export function Skeleton({ className }: { className?: string }) {
  // aria-hidden: screen readers should hear one "loading" message from the page, not many empty boxes.
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-surface-2", className)} />;
}
