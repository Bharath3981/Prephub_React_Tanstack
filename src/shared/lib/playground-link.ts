/**
 * Helpers for the "Open in playground" button on code samples (the same rules as the Next.js PrepHub site).
 *
 * The playground is a separate app (apps/playground in the PrepHub repo). The code travels in the URL hash
 * (`<playground>#code=<base64url>`): a hash is never sent to a server, and the playground decodes it on load.
 */

/** Where the playground app runs. Set VITE_PLAYGROUND_URL for another address. */
const PLAYGROUND_URL = (import.meta.env.VITE_PLAYGROUND_URL as string | undefined) ?? "http://localhost:5173";

/** Sections whose code samples get the code editor view: "<category>/<section>". */
const EDITOR_SECTIONS = new Set(["javascript/coding-questions"]);
/** Topics where every section gets it (React questions and lessons, and the machine-coding tasks). */
const EDITOR_CATEGORIES = new Set(["react", "coding-round"]);

export const usesCodeEditor = (category: string, section: string): boolean => EDITOR_CATEGORIES.has(category) || EDITOR_SECTIONS.has(`${category}/${section}`);

/** The languages shown in the editor view (the label for each). Anything else (html, sql, bash, text) stays a plain block. */
export const EDITOR_LANGUAGES: Record<string, string> = { js: "JavaScript", javascript: "JavaScript", jsx: "JSX", ts: "TypeScript", typescript: "TypeScript", tsx: "TSX" };

/** Languages the playground can run (a plain JavaScript worker: no TypeScript, no JSX). */
const RUNNABLE = new Set(["js", "javascript"]);

/** Browser, React and module code cannot run in the playground's worker. */
const NEEDS_A_PAGE = /\b(document|window|localStorage|useState|useEffect)\b|^\s*import\s|\brequire\(/m;

export const isRunnable = (language: string, code: string): boolean => RUNNABLE.has(language) && !NEEDS_A_PAGE.test(code);

/** Statements that start a timer, a task or a promise: printing their return value would only be noise. */
const NO_ECHO = /^(console|setTimeout|setInterval|clearTimeout|clearInterval|queueMicrotask|process|Promise|await)\b/;
const RESULT_COMMENT = /^([A-Za-z_$][\w$.]*\(.*\));?([ \t]*\/\/[ \t]*\S.*)$/;

const balanced = (text: string): boolean => {
  let depth = 0;
  for (const char of text) {
    if (char === "(") depth++;
    else if (char === ")" && --depth < 0) return false;
  }
  return depth === 0;
};

/**
 * Answers write `twoSum([1, 2], 3);   // [0, 1]` to show the result, which prints nothing when run. Wrap such a
 * top-level call in console.log so the playground shows the same value the comment promises.
 */
export function prepareForPlayground(code: string): string {
  let changed = false;
  const lines = code.split("\n").map((line) => {
    const match = RESULT_COMMENT.exec(line);
    if (!match || NO_ECHO.test(line) || line.includes("console.") || !balanced(match[1]!)) return line;
    changed = true;
    return `console.log(${match[1]});${match[2]}`;
  });
  return changed ? ["// PrepHub: calls that end with a // result comment are wrapped in console.log so you can see the value.", ...lines].join("\n") : code;
}

const toBase64Url = (text: string): string => {
  let binary = "";
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
};

export const playgroundHref = (code: string): string => `${PLAYGROUND_URL}#code=${toBase64Url(prepareForPlayground(code))}`;
