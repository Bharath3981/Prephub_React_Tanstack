import { useRenderCount } from "@/shared/dev/render-count";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Badge } from "@/shared/ui/Badge";

/** A stand-in for a page that a later module builds. */
export function PlaceholderPage({ title, module }: { title: string; module: string }) {
  useRenderCount("PlaceholderPage");
  useDocumentTitle(title);
  return (
    <div className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <Badge tone="warning">Coming in {module}</Badge>
    </div>
  );
}
