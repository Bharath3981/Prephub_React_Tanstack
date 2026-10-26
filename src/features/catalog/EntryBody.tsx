import { useMemo } from "react";
import { htmlToReact } from "@/features/catalog/html-to-react";

/**
 * The body of an entry: HTML from the API, sanitised, then turned into React elements (code samples become CodeBlock).
 * Done once per body (useMemo), not on every render. Links to our own pages are router links (see html-to-react.tsx).
 * `editor`: show JavaScript and TypeScript samples in the code editor view (decided per topic, see usesCodeEditor).
 */
export function EntryBody({ html, editor }: { html: string; editor: boolean }) {
  const content = useMemo(() => htmlToReact(html, { editor }), [html, editor]);
  return <div className="entry-body">{content}</div>;
}
