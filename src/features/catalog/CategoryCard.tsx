import { Link } from "react-router";
import { categoryQueries } from "@/features/catalog/queries";
import type { DeliveryCategory } from "@/features/catalog/types";
import { useIntentPrefetch } from "@/shared/hooks/useIntentPrefetch";
import { Badge } from "@/shared/ui/Badge";

export function CategoryCard({ category }: { category: DeliveryCategory }) {
  const sections = category.sectionCount === 1 ? "1 section" : `${category.sectionCount} sections`;
  // Hovering or focusing the card starts loading the topic page, so the click opens it from the cache.
  const intent = useIntentPrefetch((client) => client.prefetchQuery(categoryQueries.detail(category.slug)));
  return (
    <li>
      {/* The whole card is one link, so it is one tab stop and one big click target. */}
      <Link
        to={`/${category.slug}`}
        {...intent}
        className="flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
      >
        <h3 className="text-lg font-semibold">{category.name}</h3>
        {category.description && <p className="line-clamp-3 text-sm text-muted">{category.description}</p>}
        <Badge className="mt-auto self-start">{sections}</Badge>
      </Link>
    </li>
  );
}
