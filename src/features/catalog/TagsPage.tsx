import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useListParams } from "@/features/catalog/list-params";
import { tagQueries } from "@/features/catalog/queries";
import { TagLink } from "@/features/catalog/TagLink";
import type { TagsPage as TagsPageData, TagWithCount } from "@/features/catalog/types";
import { useRenderCount } from "@/shared/dev/render-count";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Pagination } from "@/shared/ui/Pagination";
import { Skeleton } from "@/shared/ui/Skeleton";
import type { TagWeight } from "@/shared/ui/TagChip";

interface WeightedTag extends TagWithCount {
  weight: TagWeight;
}

/**
 * Works out how big each tag is drawn, INSIDE the query (`select`). A module-level function, so Query runs it only when the
 * data changes and returns the same objects otherwise: the page component only draws. The size comes from how the tag's
 * count compares with the most used tag ON THIS PAGE (tags arrive most used first, so page 1 has the biggest).
 */
const selectWeighted = (data: TagsPageData): { tags: WeightedTag[]; total: number; totalPages: number; page: number } => {
  const max = Math.max(1, ...data.tags.map((tag) => tag.entryCount));
  return {
    tags: data.tags.map((tag) => ({ ...tag, weight: (tag.entryCount >= max * 0.6 ? 4 : tag.entryCount >= max * 0.3 ? 3 : tag.entryCount >= max * 0.1 ? 2 : 1) as TagWeight })),
    total: data.meta.total,
    totalPages: data.meta.totalPages,
    page: data.meta.page,
  };
};

/** TAGS PAGE: /tags. Every tag with how many entries use it, most used first, as a cloud. 100 tags per page (the API's maximum). */
export function TagsPage() {
  useRenderCount("TagsPage");
  useDocumentTitle("Tags");

  const { page, to } = useListParams();
  const pageLink = useCallback((next: number) => to({ page: next }), [to]);

  const tags = useQuery({ ...tagQueries.list(page), placeholderData: keepPreviousData, select: selectWeighted });
  const data = tags.data;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Tags" }]} />
        <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
        <p className="max-w-2xl text-muted">{data ? `${data.total} tags, most used first.` : "Every tag, most used first."} Pick one to see its entries.</p>
      </header>

      {tags.isError && !data && <ErrorState title="Could not load the tags" error={tags.error} onRetry={() => void tags.refetch()} />}

      {tags.isPending && (
        <div role="status" aria-busy="true" className="flex flex-wrap gap-2">
          <span className="sr-only">Loading tags...</span>
          {Array.from({ length: 24 }, (_, i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-full" />
          ))}
        </div>
      )}

      {data && (
        <ul aria-busy={tags.isPlaceholderData} className={tags.isPlaceholderData ? "flex flex-wrap items-center gap-2 opacity-60 transition-opacity" : "flex flex-wrap items-center gap-2"}>
          {data.tags.map((tag) => (
            <li key={tag.slug}>
              <TagLink tag={tag} count={tag.entryCount} weight={tag.weight} />
            </li>
          ))}
        </ul>
      )}

      {data && <Pagination page={data.page} totalPages={data.totalPages} to={pageLink} />}
    </div>
  );
}
