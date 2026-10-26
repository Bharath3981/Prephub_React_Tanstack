import { Link } from "react-router";
import { Container } from "@/shared/ui/Container";

export function Footer() {
  return (
    <footer className="border-t border-border py-6 text-sm text-muted">
      <Container className="flex flex-wrap items-center justify-between gap-2">
        <span>PrepHub React + TanStack Query: interview preparation, one concept at a time.</span>
        {import.meta.env.DEV && (
          <nav aria-label="Development tools" className="flex gap-3">
            <Link className="underline" to="/dev/boom">Crash</Link>
          </nav>
        )}
      </Container>
    </footer>
  );
}
