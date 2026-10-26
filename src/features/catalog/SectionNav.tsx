import { memo, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { NavGroup } from "@/features/catalog/group-entries";
import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/Skeleton";
import { useRenderCount } from "@/shared/dev/render-count";

interface NavProps {
  category: string;
  section: string;
  sectionName: string;
  groups: NavGroup[];
  /** Slug of the open entry, or undefined on the list page. */
  current: string | undefined;
}

const link = "block rounded-lg px-3 py-2 text-sm";
const on = "bg-accent-soft font-semibold text-accent-strong";
const off = "text-muted hover:bg-surface-2 hover:text-foreground";

/**
 * Every entry of the section under its heading, with the open one highlighted. "All ..." is the list page.
 *
 * memo: the layout re-renders on every filter or page change, but these 45 links only change when the section or the
 * open entry changes. memo can only skip if every prop is the same as last time: `current` is a string, and `groups` is
 * the same array (SectionLayout builds it with useMemo). That is also why the open entry is a PROP and is not read with
 * useParams in here: a component that calls useParams re-renders on every navigation, whatever its props are.
 */
const Nav = memo(function Nav({ category, section, sectionName, groups, current }: NavProps) {
  useRenderCount("SectionNav");
  return (
    <nav aria-label={`In ${sectionName}`} className="space-y-6">
      <Link to={`/${category}/${section}`} aria-current={current === undefined ? "page" : undefined} className={cn(link, "font-medium", current === undefined ? on : off)}>
        All {sectionName.toLowerCase()}
      </Link>
      {groups.map((group, i) => (
        <div key={group.heading ?? `group-${i}`}>
          {group.heading && <p className="mb-1.5 px-3 text-xs font-bold uppercase tracking-wider text-foreground">{group.heading}</p>}
          <ul className="space-y-0.5 pl-2">
            {group.items.map((item) => (
              <li key={item.slug}>
                <Link to={`/${category}/${section}/${item.slug}`} aria-current={current === item.slug ? "page" : undefined} className={cn(link, current === item.slug ? on : off)}>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
});

/**
 * The side panel on wide screens. It scrolls on its own; when it first appears, the open entry is brought into view.
 *
 * memo: SectionLayout renders on every filter or page change (the URL changed). SectionLayout builds this panel's props
 * from strings and the memoised `groups` array, so they are equal to last time and memo skips the render.
 */
export const SectionNavDesktop = memo(function SectionNavDesktop(props: NavProps) {
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Only once (someone who lands on an entry far down the list). After that the panel keeps the scroll position the visitor left it at.
    const box = scroller.current;
    const active = box?.querySelector<HTMLElement>('[aria-current="page"]');
    if (box && active) box.scrollTop = Math.max(0, active.offsetTop - box.clientHeight / 2);
  }, []);
  return (
    <div ref={scroller} className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-6 pr-2">
      <Nav {...props} />
    </div>
  );
});

/**
 * "In this section" on small screens: a disclosure that closes itself after the visitor picks an entry.
 * memo for the same reason as SectionNavDesktop (the two panels are twins; both are mounted, one is hidden by CSS).
 */
export const SectionNavMobile = memo(function SectionNavMobile(props: NavProps) {
  const { current } = props;
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [current]);
  return (
    <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)} className="mb-6 rounded-xl border border-border bg-surface lg:hidden">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium">In this section ▾</summary>
      <div className="border-t border-border p-3">
        <Nav {...props} />
      </div>
    </details>
  );
});

export function SectionNavSkeleton() {
  return (
    <div role="status" aria-busy="true" className="hidden space-y-3 lg:block">
      <span className="sr-only">Loading the list of entries...</span>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-5 w-5/6" />
      ))}
    </div>
  );
}
