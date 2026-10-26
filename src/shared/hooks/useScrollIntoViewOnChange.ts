import { useEffect, useRef, type RefObject } from "react";

/**
 * Scrolls `ref` into view when `value` CHANGES (for example the page number of a list). The pager is at the bottom of
 * the page, so without this the next page would start out of sight.
 *
 * It compares with the previous value instead of skipping "the first run": Strict Mode runs every effect twice when a
 * component mounts, which would make a "first run" flag scroll the page on load.
 */
export function useScrollIntoViewOnChange(ref: RefObject<HTMLElement | null>, value: unknown) {
  const previous = useRef(value);
  useEffect(() => {
    if (Object.is(previous.current, value)) return;
    previous.current = value;
    ref.current?.scrollIntoView({ block: "start" });
  }, [ref, value]);
}
