import { Link } from "react-router";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { buttonClass } from "@/shared/ui/Button";

export function NotFoundPage() {
  useDocumentTitle("Page not found");
  return (
    <div className="space-y-3 py-10 text-center">
      <p className="text-5xl font-bold text-muted">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className={buttonClass("primary")}>
        Back to the home page
      </Link>
    </div>
  );
}
