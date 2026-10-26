import { useEffect, useRef, useState } from "react";
import type { Difficulty } from "@/features/catalog/types";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { Button } from "@/shared/ui/Button";
import { useRenderCount } from "@/shared/dev/render-count";

const LEVELS: { value: Difficulty | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

const DEBOUNCE_MS = 500;

interface Props {
  difficulty: Difficulty | undefined;
  /** The search text that is in the URL right now. */
  search: string;
  /** Leave out when the list cannot be filtered by difficulty (the search endpoint): the buttons are then not drawn. */
  onDifficulty?: (difficulty: Difficulty | undefined) => void;
  onSearch: (search: string) => void;
  /** What the search box is called (its label and placeholder). */
  searchLabel?: string;
}

/** Difficulty buttons and a search box. The URL is the truth; the box keeps its own text while typing and writes to the URL after a pause. */
export function EntryFilters({ difficulty, search, onDifficulty, onSearch, searchLabel = "Search in this section" }: Props) {
  useRenderCount("EntryFilters");
  // What is in the box right now. It changes on every keystroke, so the box always feels instant.
  const [draft, setDraft] = useState(search);
  // The same text, but only after DEBOUNCE_MS without typing. This is the one allowed to touch the URL (and so the request).
  const debouncedDraft = useDebouncedValue(draft, DEBOUNCE_MS);
  // The last value this component wrote to the URL. A different value in the URL means the user pressed Back or followed a link.
  const written = useRef(search);

  // The parent's callback is a new function on every render; a ref gives the effect below the latest one without re-running it.
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  // URL to box: Back, Forward or a pasted link changed the search, so show it in the box.
  useEffect(() => {
    if (search !== written.current) {
      written.current = search;
      setDraft(search);
    }
  }, [search]);

  // Box to URL: typing has paused, so write the text to the URL.
  useEffect(() => {
    if (debouncedDraft.trim() === written.current.trim()) return;
    written.current = debouncedDraft;
    onSearchRef.current(debouncedDraft);
  }, [debouncedDraft]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {onDifficulty && (
      <div role="group" aria-label="Difficulty" className="flex gap-1.5">
        {LEVELS.map((level) => (
          <Button key={level.label} size="sm" variant={difficulty === level.value ? "primary" : "secondary"} aria-pressed={difficulty === level.value} onClick={() => onDifficulty(level.value)}>
            {level.label}
          </Button>
        ))}
      </div>
      )}
      <label className="flex-1">
        <span className="sr-only">{searchLabel}</span>
        <input
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={searchLabel}
          maxLength={100}
          className="h-8 w-full min-w-48 rounded-lg border border-border bg-surface px-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </label>
    </div>
  );
}
