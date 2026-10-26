import { useRef, useState } from "react";
import { Button } from "@/shared/ui/Button";

/**
 * Development only: a STALE CLOSURE, and the ref that fixes it. This is the bug behind many broken debounced callbacks.
 *
 * Every render of a component creates new functions. A function made during render N "remembers" the props and state of
 * render N. If it runs LATER (after a timer, after a request), it still sees the old values, even though the screen shows newer ones.
 *
 * Type, press "Save in 2 seconds", keep typing for two more seconds, and compare what each box saves.
 */
function StaleBox() {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState("(nothing yet)");

  // The arrow function below was created in THIS render, so `text` inside it is the value from this render: the one at click time.
  const saveLater = () => setTimeout(() => setSaved(text), 2000);

  return (
    <Box title="Stale: reads `text` from the render that scheduled the timer">
      <input value={text} onChange={(event) => setText(event.target.value)} className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm" aria-label="Stale text" placeholder="Type, click, keep typing" />
      <Button onClick={saveLater}>Save in 2 seconds</Button>
      <p className="text-sm">
        Saved: <b data-testid="stale-saved">{saved}</b>
      </p>
    </Box>
  );
}

function FreshBox() {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState("(nothing yet)");
  // A ref is ONE object that lives as long as the component. Writing the latest text into it on every change means a
  // timer that reads `latest.current` later gets the newest value, not the one from an old render.
  const latest = useRef(text);

  const onChange = (value: string) => {
    latest.current = value;
    setText(value);
  };
  const saveLater = () => setTimeout(() => setSaved(latest.current), 2000);

  return (
    <Box title="Fixed: reads the latest value through a ref">
      <input value={text} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm" aria-label="Fresh text" placeholder="Type, click, keep typing" />
      <Button onClick={saveLater}>Save in 2 seconds</Button>
      <p className="text-sm">
        Saved: <b data-testid="fresh-saved">{saved}</b>
      </p>
    </Box>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function DevStaleClosurePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Stale closure</h1>
        <p className="max-w-2xl text-muted">Type "ab", press Save, then keep typing to "abcdef" within two seconds. The stale box saves "ab"; the fixed box saves "abcdef".</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <StaleBox />
        <FreshBox />
      </div>
    </div>
  );
}
