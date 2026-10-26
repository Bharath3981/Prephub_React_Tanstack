import { useEffect } from "react";

const SITE = "PrepHub";

/**
 * Sets the browser tab title for the page that calls it: "Fiber · PrepHub". With no title it is just "PrepHub".
 *
 * Why it matters: in a single-page app the page never reloads, so the title does not change by itself. The tab, the history
 * list, bookmarks and screen readers (which announce the title when a page opens) would all keep showing the first page's.
 * The cleanup puts "PrepHub" back, so a page that does not set a title never keeps the previous page's.
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : SITE;
    return () => {
      document.title = SITE;
    };
  }, [title]);
}
