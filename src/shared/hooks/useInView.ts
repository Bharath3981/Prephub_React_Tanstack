import { useEffect, useRef } from "react";

/**
 * Calls `onEnter` whenever the element in the returned ref scrolls into view (or near it: `rootMargin`).
 * Built on IntersectionObserver, which the browser runs off the main thread: no scroll listener, no layout measuring on every scroll.
 *
 * `onEnter` is kept in a ref, so a new function on every render does not rebuild the observer (and does not read stale state).
 * `enabled` false switches the observer off, for example while a page is already loading or when there is nothing more to load.
 */
export function useInView<T extends Element>(onEnter: () => void, { enabled = true, rootMargin = "300px" }: { enabled?: boolean; rootMargin?: string } = {}) {
  const element = useRef<T>(null);
  const latest = useRef(onEnter);
  useEffect(() => {
    latest.current = onEnter;
  });

  useEffect(() => {
    const node = element.current;
    if (!enabled || !node) return;
    const observer = new IntersectionObserver((entries) => entries.some((entry) => entry.isIntersecting) && latest.current(), { rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return element;
}
