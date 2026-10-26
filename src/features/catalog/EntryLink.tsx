import { Link, type LinkProps } from "react-router";
import { entryDetailQuery } from "@/features/catalog/queries";
import { useIntentPrefetch } from "@/shared/hooks/useIntentPrefetch";

/**
 * A link to an entry that starts loading the entry when the pointer arrives or the link gets focus (prefetch on intent).
 * Used by the side panel, "Related" and "Previous / Next", so opening an entry from any of them is usually instant.
 */
export function EntryLink({ categorySlug, sectionSlug, slug, ...props }: { categorySlug: string; sectionSlug: string; slug: string } & Omit<LinkProps, "to">) {
  const intent = useIntentPrefetch((client) => client.prefetchQuery(entryDetailQuery(categorySlug, sectionSlug, slug)));
  return <Link to={`/${categorySlug}/${sectionSlug}/${slug}`} {...intent} {...props} />;
}
