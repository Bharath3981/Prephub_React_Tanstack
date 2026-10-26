import { memo, Suspense, use, useDeferredValue, useEffect, useLayoutEffect, useState, useTransition, type Ref } from "react";
import { getCategories } from "@/features/catalog/api";
import { Button } from "@/shared/ui/Button";

/**
 * Development only: four things from React 18 and 19 that this app uses or could use.
 *   1. `ref` as an ordinary prop (React 19: no forwardRef)
 *   2. `use(promise)`: read a promise during render; the nearest Suspense shows a fallback until it is ready
 *   3. `useTransition`: mark an update as "not urgent", so the old screen stays while the new one is prepared
 *   4. `useDeferredValue`: keep typing responsive while a slow list catches up
 */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

// ---- 1. ref as a prop ------------------------------------------------------------------------------------------
// Before React 19 a function component could not receive `ref` as a prop: it had to be wrapped in forwardRef.
function LabelledInput({ label, ref }: { label: string; ref?: Ref<HTMLInputElement> }) {
  return (
    <label className="block text-sm">
      {label}
      <input ref={ref} className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-1.5" />
    </label>
  );
}
function RefAsProp() {
  // The ref goes straight to the <input> inside LabelledInput.
  const input = (node: HTMLInputElement | null) => {
    (window as unknown as { __demoInput?: HTMLInputElement | null }).__demoInput = node;
  };
  return (
    <Section title="1. ref as a prop">
      <LabelledInput label="Name" ref={input} />
      <Button onClick={() => (window as unknown as { __demoInput?: HTMLInputElement }).__demoInput?.focus()}>Focus the input from outside</Button>
    </Section>
  );
}

// ---- 2 and 3. use(promise) with useTransition -------------------------------------------------------------------
// The promise is created OUTSIDE render (here in state). A promise created during render would be a new promise on every
// render, and `use` would wait for a new one forever.
function TopicCount({ promise }: { promise: Promise<unknown[]> }) {
  const topics = use(promise); // suspends until the promise is ready, then returns its value
  return <p className="text-sm">The API has <b data-testid="topic-count">{topics.length}</b> topics (loaded {new Date().toLocaleTimeString()}).</p>;
}
function UseAndTransition() {
  const [promise, setPromise] = useState(() => getCategories());
  const [isPending, startTransition] = useTransition();

  const reload = () =>
    // Inside a transition the update is not urgent: React keeps showing the OLD count (isPending is true) instead of
    // replacing it with the Suspense fallback, and swaps to the new one when its promise is ready.
    startTransition(() => setPromise(getCategories()));

  return (
    <Section title="2 and 3. use(promise) and useTransition">
      <Suspense fallback={<p role="status" className="text-sm text-muted">Loading the topics...</p>}>
        <div className={isPending ? "opacity-50 transition-opacity" : undefined}>
          <TopicCount promise={promise as Promise<unknown[]>} />
        </div>
      </Suspense>
      <Button onClick={reload} disabled={isPending}>
        {isPending ? "Reloading..." : "Reload"}
      </Button>
    </Section>
  );
}

// ---- 4. useDeferredValue ---------------------------------------------------------------------------------------
function SlowItem({ text }: { text: string }) {
  const start = performance.now();
  while (performance.now() - start < 1) {
    /* a deliberately slow row: 1 ms each */
  }
  return <li className="text-sm">{text}</li>;
}
// memo is REQUIRED for useDeferredValue to help: the first, urgent render passes the OLD deferred value, and memo lets React
// skip the slow list because its prop did not change. Without memo the list would still render on every keystroke.
const SlowList = memo(function SlowList({ query }: { query: string }) {
  const items = Array.from({ length: 150 }, (_, i) => `${query} #${i + 1}`);
  return (
    <ul className="max-h-32 overflow-auto" data-testid="slow-list">
      {items.map((text) => (
        <SlowItem key={text} text={text} />
      ))}
    </ul>
  );
});
function Deferred() {
  const [query, setQuery] = useState("");
  const [deferring, setDeferring] = useState(true);
  const deferred = useDeferredValue(query);
  const shown = deferring ? deferred : query;
  return (
    <Section title="4. useDeferredValue">
      <label className="block text-sm">
        Type quickly
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-1.5" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={deferring} onChange={(event) => setDeferring(event.target.checked)} /> Use useDeferredValue for the list
      </label>
      <p className="text-xs text-muted">{shown !== query ? "The list is catching up..." : "The list is up to date."}</p>
      <div className={shown !== query ? "opacity-50" : undefined}>
        <SlowList query={shown} />
      </div>
      <p className="text-sm text-muted">The list has 150 rows that take 1 ms each to render (about 150 ms). Without the deferred value every keystroke waits for it; with it the box stays instant and the list renders in the background, skipping the values you typed past.</p>
    </Section>
  );
}

// ---- 5. Effect order: the class lifecycle in hooks -------------------------------------------------------------
// componentDidMount            useEffect(() => {...}, [])
// componentDidUpdate           useEffect(() => {...}) or with a dependency array
// componentWillUnmount         the function an effect RETURNS (its cleanup)
// getSnapshotBeforeUpdate      useLayoutEffect: runs after React changed the DOM but BEFORE the browser paints
// The log below is filled by the component while it renders, commits, updates and goes away.
const events: string[] = [];
function LoggedChild({ renders }: { renders: number }) {
  events.push(`render #${renders}`);
  useLayoutEffect(() => {
    events.push(`  layout effect (DOM updated, before paint) #${renders}`);
    return () => void events.push(`  layout cleanup #${renders}`);
  });
  useEffect(() => {
    events.push(`  effect (after paint) #${renders}`);
    return () => void events.push(`  effect cleanup #${renders}`);
  });
  return <p className="text-sm">The child is on screen (render #{renders}).</p>;
}
function EffectOrder() {
  const [shown, setShown] = useState(false);
  const [renders, setRenders] = useState(1);
  const [, showLog] = useState(0); // the log is a plain array, so this only makes the section read it again
  return (
    <Section title="5. Effect order (class lifecycle in hooks)">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setShown((value) => !value)}>{shown ? "Unmount" : "Mount"}</Button>
        <Button variant="secondary" disabled={!shown} onClick={() => setRenders((n) => n + 1)}>
          Re-render
        </Button>
        <Button variant="ghost" onClick={() => showLog((n) => n + 1)}>
          Show log
        </Button>
        <Button variant="ghost" onClick={() => (events.length = 0) || setRenders(1)}>
          Clear log
        </Button>
      </div>
      {shown && <LoggedChild renders={renders} />}
      <pre data-testid="effect-log" className="max-h-40 overflow-auto rounded-md bg-surface-2 p-3 text-xs">
        {events.join("\n") || "(press Mount)"}
      </pre>
      <p className="text-sm text-muted">Order on an update: render, the previous layout cleanup, the new layout effect, then the browser paints, then the previous effect cleanup and the new effect. Unmount runs both cleanups. Press "Show log" to read the log after an action.</p>
    </Section>
  );
}

export function DevReact19Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">React 18 and 19 features</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <RefAsProp />
        <UseAndTransition />
        <Deferred />
        <EffectOrder />
      </div>
    </div>
  );
}
