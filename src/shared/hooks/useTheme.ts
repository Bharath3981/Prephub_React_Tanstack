import { useSyncExternalStore } from "react";
import { getThemeState, setThemePreference, subscribeTheme } from "@/shared/lib/theme-store";

/** The current theme choice, kept in step with the store. Only components that call this re-render on a change. */
export function useTheme() {
  const state = useSyncExternalStore(subscribeTheme, getThemeState);
  return { ...state, setPreference: setThemePreference };
}
