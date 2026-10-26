import { useTheme } from "@/shared/hooks/useTheme";
import type { ThemePreference } from "@/shared/lib/theme-store";
import { buttonClass } from "@/shared/ui/Button";

const NEXT: Record<ThemePreference, ThemePreference> = { light: "dark", dark: "system", system: "light" };
const LABEL: Record<ThemePreference, string> = { light: "Light", dark: "Dark", system: "System" };

const iconProps = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className: "shrink-0", "aria-hidden": true } as const;

const icons: Record<ThemePreference, React.ReactNode> = {
  light: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  dark: (
    <svg {...iconProps}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  ),
  system: (
    <svg {...iconProps}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  ),
};

/** One button that cycles Light, Dark, System. The page repaints by itself: only this button re-renders. */
export function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  const next = NEXT[preference];
  return (
    <button
      type="button"
      className={buttonClass("ghost", "md", "w-10 px-0!")}
      onClick={() => setPreference(next)}
      aria-label={`Theme: ${LABEL[preference]}. Switch to ${LABEL[next]}`}
      title={`Theme: ${LABEL[preference]}`}
    >
      {icons[preference]}
    </button>
  );
}
