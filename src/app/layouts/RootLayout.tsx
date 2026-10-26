import { Outlet } from "react-router";
import { Footer } from "@/app/layouts/Footer";
import { Header } from "@/app/layouts/Header";
import { useRenderCount } from "@/shared/dev/render-count";
import { RenderPanel } from "@/shared/dev/RenderPanel";
import { Container } from "@/shared/ui/Container";

/**
 * The frame around every page: header, the current page (<Outlet />) and footer.
 * It stays mounted while you move between pages, so only the page inside the Outlet changes.
 */
export function RootLayout() {
  useRenderCount("RootLayout");
  return (
    <div className="flex min-h-screen flex-col">
      {/* First focusable element: lets keyboard users skip the header and jump to the content. */}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-30 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Header />
      {/* tabIndex -1: the skip link and RouteFocus can move focus here, but it is not a stop when tabbing. */}
      <main id="main" tabIndex={-1} className="flex-1 py-8 focus:outline-none">
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
      {import.meta.env.DEV && <RenderPanel />}
    </div>
  );
}
