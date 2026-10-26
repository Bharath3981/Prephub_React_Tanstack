import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useParams } from "react-router";
import { NotFoundPage } from "@/app/pages/NotFoundPage";
import { EntryResults } from "@/features/catalog/EntryResults";
import { PAGE_SIZE, useListParams } from "@/features/catalog/list-params";
import { findCachedTag, keepWhileSame, tagQueries } from "@/features/catalog/queries";
import { usePrefetchNextPage } from "@/features/catalog/usePrefetchNextPage";
import type { TagEntries } from "@/features/catalog/types";
import { isNotFound } from "@/shared/api/not-found";
import { useRenderCount } from "@/shared/dev/render-count";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";

/**
 * TAG PAGE: /tags/:tag. One tag and the entries that use it, one page at a time.
 *
 * - The header (name and count) comes from the tags LIST in the cache when the visitor clicked a tag there, so it shows at once.
 * - An unknown tag makes the API answer 404; the retry rule does not retry it, so the not-found page appears immediately.
 * - The API ignores difficulty on this endpoint, so there are no filters here, only the pager.
 * - Key position 3 of ["catalog","tags","detail",slug,...] is the slug: the previous page stays dimmed only for the SAME tag.
 */
export function TagPage() {
  useRenderCount("TagPage");
  const slug = useParams().tag ?? "";
  const queryClient = useQueryClient();

  const { page, to } = useListParams();
  const pageLink = useCallback((next: number) => to({ page: next }), [to]);

  const result = useQuery({ ...tagQueries.detail(slug, page, PAGE_SIZE), placeholderData: keepWhileSame<TagEntries>(3, slug) });
  const tag = result.data?.tag ?? findCachedTag(queryClient, slug);
  const missing = result.isError && isNotFound(result.error);

  usePrefetchNextPage({
    page,
    totalPages: result.data?.entries.meta.totalPages ?? 0,
    isPlaceholder: result.isPlaceholderData,
    keyParts: [slug],
    prefetch: (client, next) => client.prefetchQuery(tagQueries.detail(slug, next, PAGE_SIZE)),
  });

  useDocumentTitle(missing ? "Page not found" : tag ? `#${tag.name}` : "Tag");
  if (missing) return <NotFoundPage />;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Tags", to: "/tags" }, { label: tag ? `#${tag.name}` : "..." }]} />
        <h1 className="text-3xl font-bold tracking-tight">{tag ? `#${tag.name}` : "Tag"}</h1>
        {tag && (
          <p className="text-muted">
            {tag.entryCount} {tag.entryCount === 1 ? "entry" : "entries"} use this tag.
          </p>
        )}
      </header>

      <EntryResults
        state={{ data: result.data?.entries, isPending: result.isPending, isError: result.isError, error: result.error, isPlaceholderData: result.isPlaceholderData, refetch: result.refetch }}
        pageLink={pageLink}
        emptyText="No published entries use this tag."
      />
    </div>
  );
}
