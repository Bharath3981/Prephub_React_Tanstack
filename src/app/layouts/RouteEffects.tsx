import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";

/**
 * After a page change, move keyboard focus to the main content.
 *
 * A normal website reloads on a link click, so focus goes back to the top of the new page. In a single-page app nothing
 * reloads: focus would stay on the link that was clicked (maybe at the bottom of the old page or inside the side panel), and
 * a screen reader would hear nothing. Moving focus to <main> starts the new page from its top.
 *
 * It watches only the path, not the query string: typing in the search box or changing the page of a list changes the query
 * string, and must not take focus away from the box.
 * Kept in its own small component so that only it re-renders on a navigation, not the whole layout.
 */
export function RouteFocus() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false; // the first page load: leave focus alone
      return;
    }
    document.getElementById("main")?.focus({ preventScroll: true }); // scrolling is ScrollRestoration's job
  }, [pathname]);
  return null;
}

/**
 * Tells screen reader users that a new page opened: it reads out the document title whenever the title changes.
 * (A page load does this by itself; a single-page app has to do it.) The title is set by useDocumentTitle once the page's
 * data has arrived, so the announcement names the real page, not "loading".
 */
export function RouteAnnouncer() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    const titleElement = document.querySelector("title");
    if (!titleElement) return;
    const observer = new MutationObserver(() => setMessage(document.title));
    observer.observe(titleElement, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
