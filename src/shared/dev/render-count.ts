import { useEffect } from "react";

/**
 * Development helper for the "render budget" of a page: counts how many times a component COMMITTED a render.
 * Read the numbers in the browser console with: window.__renders
 *
 * It counts in an effect (after the commit), not in the render body, so it counts committed renders only.
 * (If you turn Strict Mode on, every component mounts twice in development and the first count becomes 2.)
 * In a production build the effect does nothing.
 */
export function useRenderCount(name: string) {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as { __renders?: Record<string, number> };
    w.__renders ??= {};
    w.__renders[name] = (w.__renders[name] ?? 0) + 1;
  });
}
