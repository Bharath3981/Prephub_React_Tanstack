import { memo } from "react";
import { Link } from "react-router";

export interface Crumb {
  label: string;
  /** Leave it out for the current page (the last crumb). */
  to?: string;
}

/** "Home / React / Interview Questions". The last item is the current page and is not a link. */
export const Breadcrumbs = memo(function({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.to ? (
              <Link to={item.to} className="hover:text-foreground hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
});
