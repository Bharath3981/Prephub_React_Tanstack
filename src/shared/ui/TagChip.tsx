import type { HTMLAttributes } from "react";
import { Link } from "react-router";
import { cn } from "@/shared/lib/cn";

/** How big a tag is drawn in a tag cloud: more used tags are larger. */
export type TagWeight = 1 | 2 | 3 | 4;
const sizes: Record<TagWeight, string> = { 1: "text-xs", 2: "text-sm", 3: "text-base", 4: "text-lg font-medium" };

/**
 * A tag as a link to its page (/tags/<slug>): "#Fiber", with the number of entries when you pass `count`.
 * `weight` makes it bigger for a tag cloud. `intent` takes event handlers (for example prefetching on hover), so this
 * shared piece does not need to know about queries.
 * Do not use it inside another link (a whole-card link), where a Badge is right.
 */
export function TagChip({ tag, count, weight = 1, intent }: { tag: { name: string; slug: string }; count?: number; weight?: TagWeight; intent?: Pick<HTMLAttributes<HTMLAnchorElement>, "onPointerEnter" | "onFocus"> }) {
  return (
    <Link
      to={`/tags/${tag.slug}`}
      {...intent}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-muted transition-colors hover:border-accent hover:text-accent",
        sizes[weight],
      )}
    >
      #{tag.name}
      {count !== undefined && <span className="rounded-full bg-surface-2 px-1.5 text-[10px] tabular-nums">{count}</span>}
    </Link>
  );
}
