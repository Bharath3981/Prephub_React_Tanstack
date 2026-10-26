import hljs from "highlight.js/lib/core";
import type { LanguageFn } from "highlight.js";

/**
 * Syntax highlighting, loaded on demand.
 *
 * This file is imported with `import()` (see CodeBlock), so the highlighter is a separate file that the browser downloads
 * only when a page shows code. Each language grammar is a separate file again, loaded the first time that language is seen.
 * Only the languages the content uses are listed; an unknown language is shown as plain text.
 */
const grammars: Record<string, () => Promise<{ default: LanguageFn }>> = {
  javascript: () => import("highlight.js/lib/languages/javascript"),
  typescript: () => import("highlight.js/lib/languages/typescript"),
  bash: () => import("highlight.js/lib/languages/bash"),
  sql: () => import("highlight.js/lib/languages/sql"),
  json: () => import("highlight.js/lib/languages/json"),
  dockerfile: () => import("highlight.js/lib/languages/dockerfile"),
  http: () => import("highlight.js/lib/languages/http"),
  yaml: () => import("highlight.js/lib/languages/yaml"),
  xml: () => import("highlight.js/lib/languages/xml"),
  css: () => import("highlight.js/lib/languages/css"),
  lua: () => import("highlight.js/lib/languages/lua"),
};

/** The names used in the content (language-tsx) mapped to a grammar. */
const aliases: Record<string, string> = { js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript", sh: "bash", shell: "bash", html: "xml", yml: "yaml" };

/** The code as HTML with <span class="hljs-..."> tokens (highlight.js escapes the code itself), or null when the language is unknown. */
export async function highlight(code: string, language: string): Promise<string | null> {
  const name = aliases[language] ?? language;
  const load = grammars[name];
  if (!load) return null;
  if (!hljs.getLanguage(name)) hljs.registerLanguage(name, (await load()).default);
  return hljs.highlight(code, { language: name, ignoreIllegals: true }).value;
}
