import { createBrowserRouter } from "react-router";
import { CategoryPage } from "@/features/catalog/CategoryPage";
import { EntryPage } from "@/features/catalog/EntryPage";
import { HomePage } from "@/features/catalog/HomePage";
import { SectionLayout } from "@/features/catalog/SectionLayout";
import { SectionPage } from "@/features/catalog/SectionPage";
import { RootLayout } from "@/app/layouts/RootLayout";
import { DevBoomPage } from "@/app/pages/DevBoomPage";
import { DevFetchVsQueryPage } from "@/app/pages/DevFetchVsQueryPage";
import { DevReact19Page } from "@/app/pages/DevReact19Page";
import { DevStaleClosurePage } from "@/app/pages/DevStaleClosurePage";
import { NotFoundPage } from "@/app/pages/NotFoundPage";
import { PlaceholderPage } from "@/app/pages/PlaceholderPage";
import { RouteError } from "@/app/RouteError";

/**
 * The route tree. Two error elements on purpose:
 * - the layout route's errorElement catches errors in the layout itself (the whole screen is replaced);
 * - the pathless route inside it catches errors in a PAGE, so the header and footer stay on screen.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "questions", element: <PlaceholderPage title="Questions" module="M4" /> },
          { path: "tags", element: <PlaceholderPage title="Tags" module="M4" /> },
          { path: "search", element: <PlaceholderPage title="Search" module="M5" /> },
          // Development-only pages: a crash test for the error boundaries, and useEffect fetch vs useQuery side by side.
          ...(import.meta.env.DEV
            ? [
                { path: "dev/boom", element: <DevBoomPage /> },
                { path: "dev/fetch-vs-query", element: <DevFetchVsQueryPage /> },
                { path: "dev/stale-closure", element: <DevStaleClosurePage /> },
                { path: "dev/react-19", element: <DevReact19Page /> },
              ]
            : []),
          // A topic and its sections. The static routes above (questions, tags, search, dev/...) win over these dynamic ones.
          { path: ":category", element: <CategoryPage /> },
          // A section: the layout (side panel) stays mounted while the visitor moves between its list page and its entries.
          {
            path: ":category/:section",
            element: <SectionLayout />,
            children: [
              { index: true, element: <SectionPage /> },
              { path: ":entry", element: <EntryPage /> },
            ],
          },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
