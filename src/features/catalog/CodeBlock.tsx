import { lazy, Suspense, useEffect, useState } from "react";
import { EDITOR_LANGUAGES, isRunnable, playgroundHref } from "@/shared/lib/playground-link";
import { Button, buttonClass } from "@/shared/ui/Button";

// The editor is a separate file (CodeMirror is large): it is downloaded only when a page shows one.
const CodeView = lazy(() => import("@/features/catalog/CodeView"));

type CopyState = "idle" | "copied" | "failed";

/** The code as plain text in a <pre>. It is the first thing shown in every mode, so the code is readable before anything loads. */
function PlainCode({ code }: { code: string }) {
  return (
    <pre tabIndex={0}>
      <code>{code}</code>
    </pre>
  );
}

/**
 * A code sample from an entry: a header with the language, a Copy button (and "Open in playground" for plain JavaScript),
 * then the code.
 *
 * Two ways to show the code:
 *  - editor view (`editor` is true and the language is JavaScript or TypeScript): a read-only CodeMirror editor with line
 *    numbers. Same rule as the Next.js site: only some topics (see usesCodeEditor).
 *  - otherwise: highlight.js colours (a separate lazy file).
 * In both, the plain text shows at once and the colours arrive a moment later, so the page never waits or jumps.
 */
export function CodeBlock({ code, language, editor }: { code: string; language: string | null; editor: boolean }) {
  const useEditor = editor && language !== null && language in EDITOR_LANGUAGES;
  const [html, setHtml] = useState<string | null>(null);
  const [copy, setCopy] = useState<CopyState>("idle");

  useEffect(() => {
    if (!language || useEditor) return; // the editor does its own colours
    let cancelled = false; // the entry changed before the highlighter answered: ignore the late answer
    import("@/shared/lib/highlight")
      .then((module) => module.highlight(code, language))
      .then((result) => {
        if (!cancelled) setHtml(result);
      })
      .catch(() => {
        // the highlighter is only decoration: if it fails to load, the plain code stays
      });
    return () => {
      cancelled = true;
    };
  }, [code, language, useEditor]);

  // "Copied" goes back to "Copy" after a moment. The cleanup cancels the timer if the block disappears first.
  useEffect(() => {
    if (copy === "idle") return;
    const timer = setTimeout(() => setCopy("idle"), 1800);
    return () => clearTimeout(timer);
  }, [copy]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopy("copied");
    } catch {
      setCopy("failed"); // no permission, or an insecure page
    }
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>{language ? (useEditor ? EDITOR_LANGUAGES[language] : language) : "code"}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={copyCode} aria-label="Copy code">
            {copy === "copied" ? "Copied" : copy === "failed" ? "Could not copy" : "Copy"}
          </Button>
          {useEditor && language && isRunnable(language, code) && (
            <a href={playgroundHref(code)} target="_blank" rel="noopener" className={buttonClass("primary", "sm", "no-underline")}>
              Open in playground ↗
            </a>
          )}
        </div>
        <span className="sr-only" role="status">
          {copy === "copied" ? "Code copied to the clipboard" : copy === "failed" ? "Could not copy the code" : ""}
        </span>
      </div>
      {useEditor ? (
        // While the editor file downloads, the plain code is shown (the same text, so nothing jumps much).
        <Suspense fallback={<PlainCode code={code} />}>
          <CodeView code={code} />
        </Suspense>
      ) : html ? (
        <pre tabIndex={0}>
          <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      ) : (
        <PlainCode code={code} />
      )}
    </div>
  );
}
