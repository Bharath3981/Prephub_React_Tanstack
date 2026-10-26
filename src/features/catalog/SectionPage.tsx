import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useOutletContext } from "react-router";
import { EntryFilters } from "@/features/catalog/EntryFilters";
import { EntryResults } from "@/features/catalog/EntryResults";
import { PAGE_SIZE, useListParams } from "@/features/catalog/list-params";
import { entryQueries, keepPageInSection } from "@/features/catalog/queries";
import type { SectionContext } from "@/features/catalog/SectionLayout";
import { usePrefetchNextPage } from "@/features/catalog/usePrefetchNextPage";
import { useRenderCount } from "@/shared/dev/render-count";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { KindBadge } from "@/shared/ui/KindBadge";

/**
 * SECTION LIST PAGE: /:category/:section, for example /react/interview-questions
 *
 * Only the RIGHT-HAND part of the screen. The side panel belongs to SectionLayout (it stays mounted between entries).
 * Where the data comes from:
 *  - the topic and the section: SectionLayout, through the outlet context;
 *  - page, difficulty and search: the URL (list-params.ts), so a link or a refresh gives the same list;
 *  - the entries of this page: useQuery. The page and the filters are part of the key, so every combination is cached on its own.
 */
export function SectionPage() {
  useRenderCount("SectionPage");
  const { category, section } = useOutletContext<SectionContext>();

  const { page, difficulty, search, to, change } = useListParams();
  const pageLink = useCallback((next: number) => to({ page: next }), [to]);
  const params = { page, limit: PAGE_SIZE, difficulty, search };

  // placeholderData keeps the current page on screen (dimmed) while the next one loads, instead of a skeleton.
  // It replaces the hand-written useKeepPrevious of the pure-React app.
  const entries = useQuery({ ...entryQueries.list(category.slug, section.slug, params), placeholderData: keepPageInSection(category.slug, section.slug) });

  // While the visitor reads this page, the next one is fetched quietly, so "Next" shows it at once.
  usePrefetchNextPage({
    page,
    totalPages: entries.data?.meta.totalPages ?? 0,
    isPlaceholder: entries.isPlaceholderData,
    keyParts: [category.slug, section.slug, difficulty, search],
    prefetch: (client, next) => client.prefetchQuery(entryQueries.list(category.slug, section.slug, { ...params, page: next })),
  });

  useDocumentTitle(`${section.name} · ${category.name}`);

  const filtered = difficulty !== undefined || search.trim() !== "";
  const clearLink = useMemo(() => to({ difficulty: undefined, search: "" }), [to]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: category.name, to: `/${category.slug}` }, { label: section.name }]} />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{section.name}</h1>
          <KindBadge kind={section.kind} />
        </div>
        {section.description && <p className="max-w-2xl text-muted">{section.description}</p>}
      </header>

      <EntryResults
        state={entries}
        pageLink={pageLink}
        clearTo={clearLink}
        filtered={filtered}
        emptyText="This section has no published entries yet."
        filters={<EntryFilters difficulty={difficulty} search={search} onDifficulty={(value) => change({ difficulty: value })} onSearch={(value) => change({ search: value }, { replace: true })} />}
      />
    </div>
  );
}
