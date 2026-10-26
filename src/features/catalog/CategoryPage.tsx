import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { NotFoundPage } from "@/app/pages/NotFoundPage";
import { SectionCard } from "@/features/catalog/SectionCard";
import { categoryQueries } from "@/features/catalog/queries";
import { isNotFound } from "@/shared/api/not-found";
import { useRenderCount } from "@/shared/dev/render-count";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Skeleton } from "@/shared/ui/Skeleton";

function CategoryPageSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Loading the topic...</span>
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <li key={i} className="space-y-3 rounded-xl border border-border bg-surface p-5">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * /:category, for example /react: the topic and its sections.
 *
 * The slug comes from the URL. It is part of the query KEY, so /react and /javascript are two separate cache entries:
 * switching between them needs no "dependency array" and no manual cancelling. A slug visited before is shown from the cache.
 * An unknown slug makes the API answer 404; the global retry rule does not retry a 404, so the not-found page appears at once.
 */
export function CategoryPage() {
  useRenderCount("CategoryPage");
  const { category: slug = "" } = useParams();
  const result = useQuery(categoryQueries.detail(slug));

  const notFound = result.isError && isNotFound(result.error);
  useDocumentTitle(notFound ? "Page not found" : result.data?.name);

  if (notFound) return <NotFoundPage />;
  if (result.isPending) return <CategoryPageSkeleton />;
  if (result.isError && !result.data) return <ErrorState title="Could not load this topic" error={result.error} onRetry={() => void result.refetch()} />;

  const category = result.data!;
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: category.name }]} />
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        {category.description && <p className="max-w-2xl text-muted">{category.description}</p>}
      </header>

      <section aria-labelledby="sections-heading">
        <h2 id="sections-heading" className="sr-only">
          Sections of {category.name}
        </h2>
        {category.sections.length === 0 ? (
          <p className="text-muted">This topic has no published sections yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {category.sections.map((section) => (
              <SectionCard key={section.slug} categorySlug={category.slug} section={section} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
