import { useEffect, useState } from "react";

/**
 * Returns `value`, but only after it has stopped changing for `delay` milliseconds.
 *
 * While the value keeps changing (someone typing), the returned value stays the old one. Each change cancels the
 * pending timer and starts a new one; only the last change survives the wait.
 *
 *   typed:     f   fi   fib  ........ (300 ms of quiet)
 *   returned:  ""  ""   ""   ........ "fib"
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // the value changed again (or we unmounted) before the delay ended
  }, [value, delay]);

  return debounced;
}
