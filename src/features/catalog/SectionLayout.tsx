import { useQuery } from "@tanstack/react-query";
import { Outlet, useParams } from "react-router";
import { NotFoundPage } from "@/app/pages/NotFoundPage";
import { navGroups, type NavGroup } from "@/features/catalog/group-entries";
import { categoryQueries, entryQueries, SECTION_PANEL_PARAMS } from "@/features/catalog/queries";
import { SectionNavDesktop, SectionNavMobile, SectionNavSkeleton } from "@/features/catalog/SectionNav";
import type { DeliveryCategoryDetail, DeliverySection, EntriesPage } from "@/features/catalog/types";
import { isNotFound } from "@/shared/api/not-found";
import { useRenderCount } from "@/shared/dev/render-count";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Skeleton } from "@/shared/ui/Skeleton";

/** What the layout hands to the page inside it (read with useOutletContext), so the page does not need to look the topic up again. */
export interface SectionContext {
  category: DeliveryCategoryDetail;
  section: DeliverySection;
}

/**
 * The side panel groups, worked out INSIDE the query with `select`. It is a function defined once at module level, so its
 * identity never changes: TanStack Query then re-runs it only when the data changes, and returns the SAME `groups` array
 * on every other render. That is what lets the memoised panel skip renders, with no useMemo in the component.
 */
const selectGroups = (page: EntriesPage): NavGroup[] | null => (page.entries.length >= 2 ? navGroups(page.entries) : null);

/**
 * The frame shared by a section's list page and all of its entries: the side panel plus the page beside it.
 * It is a layout ROUTE on purpose: it stays mounted while the visitor moves between the entries of one section.
 *
 * Its category request has the SAME key as the topic page's (["catalog","categories","detail",slug]), so a visitor who
 * just came from the topic page gets the category from the cache: no second request (the pure-React app asked again).
 */
export function SectionLayout() {
  useRenderCount("SectionLayout");
  const { category: categorySlug = "", section: sectionSlug = "", entry: currentEntry } = useParams();
  const category = useQuery(categoryQueries.detail(categorySlug));
  // All entries (the API allows 100 at most) for the panel; the list page asks for its own page separately.
  const panel = useQuery({ ...entryQueries.list(categorySlug, sectionSlug, SECTION_PANEL_PARAMS), select: selectGroups });
  const groups = panel.data ?? null;

  if (category.isError && isNotFound(category.error)) return <NotFoundPage />;
  if (category.isError && !category.data) return <ErrorState title="Could not load this topic" error={category.error} onRetry={() => void category.refetch()} />;
  if (category.isPending) {
    return (
      <div role="status" aria-busy="true" className="space-y-4">
        <span className="sr-only">Loading the section...</span>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  const topic = category.data!;
  const section = topic.sections.find((s) => s.slug === sectionSlug);
  if (!section) return <NotFoundPage />; // the topic exists but has no such section

  // A section with a single entry has nothing to navigate. The panel is a convenience: if its request fails, the page still works.
  const showNav = panel.isPending || groups !== null;
  const nav = { category: topic.slug, section: section.slug, sectionName: section.name, current: currentEntry };
  const context: SectionContext = { category: topic, section };

  return (
    <div className={showNav ? "lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10" : undefined}>
      {showNav && (
        <>
          <aside className="hidden lg:block">{groups ? <SectionNavDesktop {...nav} groups={groups} /> : <SectionNavSkeleton />}</aside>
          {groups && <SectionNavMobile {...nav} groups={groups} />}
        </>
      )}
      <div className="min-w-0">
        <Outlet context={context} />
      </div>
    </div>
  );
}
