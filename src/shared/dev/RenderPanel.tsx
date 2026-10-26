import { useEffect, useState } from "react";

/**
 * Development only: a small box in the corner that shows window.__renders (see render-count.ts).
 * It reads the numbers twice a second. Its own re-renders do not touch the rest of the app, and it is not counted.
 */
export function RenderPanel() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const id = setInterval(() => {
      const current = (window as unknown as { __renders?: Record<string, number> }).__renders ?? {};
      // Only change state when a number changed, otherwise this panel would re-render for nothing.
      setCounts((previous) => (JSON.stringify(previous) === JSON.stringify(current) ? previous : { ...current }));
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <details className="fixed bottom-3 right-3 z-40 rounded-lg border border-border bg-surface/95 p-2 text-xs shadow-md">
      <summary className="cursor-pointer select-none">Renders (dev)</summary>
      <ul className="mt-2 space-y-0.5 font-mono">
        {Object.entries(counts).map(([name, count]) => (
          <li key={name}>
            {name}: {count}
          </li>
        ))}
        {Object.keys(counts).length === 0 && <li>nothing counted yet</li>}
      </ul>
      <button className="mt-2 underline" onClick={() => ((window as unknown as { __renders?: Record<string, number> }).__renders = {})}>
        reset
      </button>
    </details>
  );
}
