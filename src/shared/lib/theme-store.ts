/**
 * The theme lives OUTSIDE React, as an attribute on <html> (data-theme="light" | "dark") that the CSS variables
 * in index.css react to. Changing it repaints the page without running any component.
 *
 * React only needs to know the choice to draw the toggle button, so this small store lets components subscribe
 * through useSyncExternalStore (see src/shared/hooks/useTheme.ts). The snapshot object is replaced only when
 * something changes, so React can compare snapshots with Object.is.
 */
export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedTheme;
}

const KEY = "theme"; // only "light" or "dark" is stored; no key means "follow the system"
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system"; // storage can throw (private mode, blocked cookies)
  }
}

const resolve = (preference: ThemePreference): ResolvedTheme =>
  preference === "system" ? (darkQuery.matches ? "dark" : "light") : preference;

const listeners = new Set<() => void>();
let state: ThemeState = { preference: readPreference(), resolved: resolve(readPreference()) };

function update(preference: ThemePreference) {
  const resolved = resolve(preference);
  if (state.preference === preference && state.resolved === resolved) return; // nothing changed: keep the same snapshot
  state = { preference, resolved };
  document.documentElement.dataset.theme = resolved;
  listeners.forEach((listener) => listener());
}

export function setThemePreference(preference: ThemePreference) {
  try {
    if (preference === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, preference);
  } catch {
    /* the choice just will not be remembered */
  }
  update(preference);
}

export const subscribeTheme = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getThemeState = () => state;

// While the choice is "system", follow the operating system when it switches between light and dark.
darkQuery.addEventListener("change", () => {
  if (state.preference === "system") update("system");
});
// Another tab changed the theme: the storage event fires in the OTHER tabs only.
window.addEventListener("storage", (event) => {
  if (event.key === KEY) update(readPreference());
});

document.documentElement.dataset.theme = state.resolved; // in case the inline script in index.html did not run
