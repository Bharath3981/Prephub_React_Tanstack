import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useLayoutEffect, useRef, useState } from "react";
import { EntryCard } from "@/features/catalog/EntryRow";
import type { EntrySummary } from "@/features/catalog/types";

/**
 * A long list where only the rows near the screen exist in the DOM ("windowing" or virtualisation).
 *
 * The page scrolls as usual (the WINDOW scrolls). The list is one tall box whose height is the sum of all row heights;
 * each visible row is positioned inside it with a translate. Rows have different heights (a summary can take 1 or 2 lines,
 * tags wrap), so each rendered row is measured (`measureElement`) and the estimate is replaced by the real height.
 *
 * Costs and traps: the browser's find-in-page cannot find text in rows that are not rendered; a row can only be positioned
 * after it is measured, so a quick jump can show a moment of empty space; scroll position must survive navigation (see the page).
 */
export function VirtualEntryList({ entries, topicName }: { entries: EntrySummary[]; topicName?: (categorySlug: string) => string | undefined }) {
  const listRef = useRef<HTMLUListElement>(null);
  // How far the list starts from the top of the document: the virtualiser needs it to map the window scroll to a row.
  const [scrollMargin, setScrollMargin] = useState(0);
  useLayoutEffect(() => setScrollMargin(listRef.current?.offsetTop ?? 0), []);

  const virtualizer = useWindowVirtualizer({
    count: entries.length,
    estimateSize: () => 150, // a typical card; replaced by the measured height of each rendered row
    gap: 12,
    overscan: 6, // render a few rows beyond the screen, so a fast scroll does not show blanks
    scrollMargin,
    getItemKey: (index) => {
      const entry = entries[index];
      return `${entry.categorySlug}/${entry.sectionSlug}/${entry.slug}`;
    },
  });

  return (
    <ul ref={listRef} style={{ height: virtualizer.getTotalSize(), position: "relative" }} data-testid="virtual-list">
      {virtualizer.getVirtualItems().map((item) => {
        const entry = entries[item.index];
        return (
          <li
            key={item.key}
            data-index={item.index}
            ref={virtualizer.measureElement}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)` }}
          >
            <EntryCard entry={entry} topic={topicName?.(entry.categorySlug)} />
          </li>
        );
      })}
    </ul>
  );
}
