import { isRouteErrorResponse, useRevalidator, useRouteError } from "react-router";
import { ErrorMessage } from "@/app/ErrorMessage";

/**
 * The router's errorElement: shown when a route throws while rendering (or later, in a loader).
 * Where it is placed decides how much of the screen is replaced (see src/app/router.tsx).
 */
export function RouteError() {
  const error = useRouteError();
  const { revalidate } = useRevalidator();

  if (isRouteErrorResponse(error)) {
    return <ErrorMessage title={`${error.status} ${error.statusText}`} error={error.data} />;
  }
  return <ErrorMessage error={error} onRetry={revalidate} />;
}
