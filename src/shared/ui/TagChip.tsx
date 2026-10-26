import { Link } from "react-router";

/**
 * A tag as a link to its page (/tags/<slug>): "#Fiber", with the number of entries when you pass `count`.
 * Do not use it inside another link (a whole-card link), where a Badge is right.
 */
export function TagChip({ tag, count }: { tag: { name: string; slug: string }; count?: number }) {
  return (
    <Link
      to={`/tags/${tag.slug}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
    >
      #{tag.name}
      {count !== undefined && <span className="rounded-full bg-surface-2 px-1.5 text-[10px] tabular-nums">{count}</span>}
    </Link>
  );
}
