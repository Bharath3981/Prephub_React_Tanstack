import { Link, NavLink } from "react-router";
import { cn } from "@/shared/lib/cn";
import { Container } from "@/shared/ui/Container";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { useRenderCount } from "@/shared/dev/render-count";

const links = [
  { to: "/questions", label: "Questions" },
  { to: "/tags", label: "Tags" },
  { to: "/search", label: "Search" },
];

export function Header() {
  useRenderCount("Header");
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      {/* Tighter spacing on a phone: logo, three links and the theme button must fit in 375px without a sideways scroll. */}
      <Container className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 py-2 sm:gap-x-6">
        <Link to="/" className="text-lg font-bold tracking-tight">
          PrepHub
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              // NavLink gives us isActive; aria-current="page" is added automatically
              className={({ isActive }) => cn("rounded-md px-2 py-1.5 hover:bg-surface-2 sm:px-3", isActive ? "font-semibold text-foreground" : "text-muted")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
