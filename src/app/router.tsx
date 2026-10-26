import { createBrowserRouter } from "react-router";
import { RootLayout } from "@/app/layouts/RootLayout";
import { DevBoomPage } from "@/app/pages/DevBoomPage";
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
          { index: true, element: <PlaceholderPage title="Home" module="M1" /> },
          { path: "questions", element: <PlaceholderPage title="Questions" module="M4" /> },
          { path: "tags", element: <PlaceholderPage title="Tags" module="M4" /> },
          { path: "search", element: <PlaceholderPage title="Search" module="M5" /> },
          // Development-only page: a crash test for the error boundaries.
          ...(import.meta.env.DEV ? [{ path: "dev/boom", element: <DevBoomPage /> }] : []),
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
