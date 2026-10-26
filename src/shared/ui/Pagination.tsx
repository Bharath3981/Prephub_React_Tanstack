import { memo } from "react";
import { Link, type To } from "react-router";
import { cn } from "@/shared/lib/cn";
import { useRenderCount } from "@/shared/dev/render-count";

/** 1, the pages around the current one, and the last: [1, "gap", 4, 5, 6, "gap", 20]. */
function pageItems(page: number, total: number): (number | "gap")[] {
  const wanted = new Set([1, total, page - 1, page, page + 1].filter((n) => n >= 1 && n <= total));
  const sorted = [...wanted].sort((a, b) => a - b);
  const items: (number | "gap")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) items.push("gap");
    items.push(n);
  });
  return items;
}

const base = "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm";

/**
 * Previous, numbered pages and next. Every page is a real link, so it can be opened in a new tab and works with the Back button.
 *
 * memo: the list page renders several times per change (URL, loading, data), but the pager only needs to change when the page,
 * the page count or its link builder changes. The parent passes `to` from useCallback; an inline function would defeat memo.
 */
export const Pagination = memo(function Pagination({ page, totalPages, to }: { page: number; totalPages: number; to: (page: number) => To }) {
  useRenderCount("Pagination");
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pages" className="flex flex-wrap items-center gap-2">
      {page > 1 ? (
        <Link to={to(page - 1)} preventScrollReset className={cn(base, "border-border bg-surface hover:border-accent")}>
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(base, "border-border text-muted opacity-50")}>
          Previous
        </span>
      )}

      {pageItems(page, totalPages).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-muted">
            ...
          </span>
        ) : (
          <Link
            key={item}
            to={to(item)}
            preventScrollReset // the list scrolls itself to its top (SectionPage), not to the top of the whole page
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={cn(base, item === page ? "border-accent bg-accent-soft font-medium text-accent-strong" : "border-border bg-surface hover:border-accent")}
          >
            {item}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link to={to(page + 1)} preventScrollReset className={cn(base, "border-border bg-surface hover:border-accent")}>
          Next
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(base, "border-border text-muted opacity-50")}>
          Next
        </span>
      )}
    </nav>
  );
});
