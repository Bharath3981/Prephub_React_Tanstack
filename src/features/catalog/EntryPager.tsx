import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { EntryLink } from "@/features/catalog/EntryLink";
import { entryDetailQuery } from "@/features/catalog/queries";
import type { NavItem } from "@/features/catalog/group-entries";
import { cn } from "@/shared/lib/cn";

const card = "block rounded-xl border border-border bg-surface p-4 hover:border-accent";

/**
 * "Previous" and "Next" at the end of an entry, in the same order as the side panel (group by group), so a section can be
 * read from the first entry to the last. Shows nothing when the order is unknown or the entry is the only one.
 */
export function EntryPager({ categorySlug, sectionSlug, order, current }: { categorySlug: string; sectionSlug: string; order: NavItem[] | null; current: string }) {
  const queryClient = useQueryClient();
  const index = order ? order.findIndex((item) => item.slug === current) : -1;
  const previous = order?.[index - 1];
  const next = order?.[index + 1];
  const previousSlug = previous?.slug;
  const nextSlug = next?.slug;

  // While the visitor reads this entry, the entries on both sides are loaded quietly: "Next" and "Previous" then open at once.
  // A neighbour that is already cached and fresh costs nothing. (Hooks come first; the early returns are below.)
  useEffect(() => {
    if (previousSlug) void queryClient.prefetchQuery(entryDetailQuery(categorySlug, sectionSlug, previousSlug));
    if (nextSlug) void queryClient.prefetchQuery(entryDetailQuery(categorySlug, sectionSlug, nextSlug));
  }, [queryClient, categorySlug, sectionSlug, previousSlug, nextSlug]);

  if (!order || index === -1 || (!previous && !next)) return null;

  return (
    <nav aria-label="Previous and next" className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
      {previous ? (
        <EntryLink categorySlug={categorySlug} sectionSlug={sectionSlug} slug={previous.slug} className={card}>
          <span className="text-xs text-muted">← Previous</span>
          <span className="mt-1 block font-medium">{previous.title}</span>
        </EntryLink>
      ) : (
        <span />
      )}
      {next && (
        <EntryLink categorySlug={categorySlug} sectionSlug={sectionSlug} slug={next.slug} className={cn(card, "sm:text-right")}>
          <span className="text-xs text-muted">Next →</span>
          <span className="mt-1 block font-medium">{next.title}</span>
        </EntryLink>
      )}
    </nav>
  );
}
