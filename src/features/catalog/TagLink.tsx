import { tagQueries } from "@/features/catalog/queries";
import { PAGE_SIZE } from "@/features/catalog/list-params";
import { useIntentPrefetch } from "@/shared/hooks/useIntentPrefetch";
import { TagChip, type TagWeight } from "@/shared/ui/TagChip";

/** A tag chip that starts loading the tag's first page when the pointer arrives or the chip gets focus. */
export function TagLink({ tag, count, weight }: { tag: { name: string; slug: string }; count?: number; weight?: TagWeight }) {
  const intent = useIntentPrefetch((client) => client.prefetchQuery(tagQueries.detail(tag.slug, 1, PAGE_SIZE)));
  return <TagChip tag={tag} count={count} weight={weight} intent={intent} />;
}

