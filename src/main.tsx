import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import { ErrorMessage } from "@/app/ErrorMessage";
import { router } from "@/app/router";
import { queryClient } from "@/shared/api/query-client";
import { QueryDevtools } from "@/shared/dev/QueryDevtools";
// Importing the store runs its setup (it applies the saved theme and starts listening for changes).
import "@/shared/lib/theme-store";

createRoot(document.getElementById("root")!).render(
  // The last safety net: catches errors the router cannot (for example in the router setup itself).
  <ErrorBoundary fallback={(error, reset) => <ErrorMessage error={error} onRetry={reset} />}>
    {/* Strict Mode is ON: in development every effect runs twice on mount. A plain useEffect fetch would send two requests
        (one cancelled); TanStack Query shares one request per query key, so this app sends one. */}
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <QueryDevtools />
      </QueryClientProvider>
    </StrictMode>
  </ErrorBoundary>,
);
