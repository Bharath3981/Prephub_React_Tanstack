import { createElement, type ReactNode } from "react";
import { Link } from "react-router";
import { CodeBlock } from "@/features/catalog/CodeBlock";
import { sanitizeHtml } from "@/shared/lib/sanitize-html";

/** Void elements have no children. */
const VOID = new Set(["br", "hr", "img"]);
/** React rejects stray whitespace between these (a warning in development), and HTML ignores it anyway. */
const NO_TEXT_BETWEEN = new Set(["table", "thead", "tbody", "tfoot", "tr", "colgroup", "ul", "ol"]);
/** HTML attribute names that React spells differently. */
const REACT_ATTRIBUTE: Record<string, string> = { class: "className", colspan: "colSpan", rowspan: "rowSpan" };

const LANGUAGE = /(?:^|\s)language-([\w+-]+)/;

function convert(node: Node, key: number, editor: boolean): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? "";
    const parent = node.parentElement?.tagName.toLowerCase();
    return parent && NO_TEXT_BETWEEN.has(parent) && text.trim() === "" ? null : text;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const element = node as Element;
  const tag = element.tagName.toLowerCase();

  // <pre><code class="language-js">...</code></pre> becomes a CodeBlock component.
  if (tag === "pre") {
    const code = element.querySelector("code");
    const language = LANGUAGE.exec(code?.getAttribute("class") ?? "")?.[1] ?? null;
    const text = (element.textContent ?? "").replace(/\n$/, ""); // every code block in the content ends with one extra newline
    return <CodeBlock key={key} code={text} language={language === "text" ? null : language} editor={editor} />;
  }

  const children = Array.from(element.childNodes).map((child, index) => convert(child, index, editor));

  // A link to one of our own pages goes through the router (no reload). Other links stay plain <a> tags.
  if (tag === "a") {
    const href = element.getAttribute("href") ?? "";
    if (href.startsWith("/") && !href.startsWith("//")) {
      return (
        <Link key={key} to={href} title={element.getAttribute("title") ?? undefined}>
          {children}
        </Link>
      );
    }
  }

  const props: Record<string, string> = {};
  for (const { name, value } of Array.from(element.attributes)) props[REACT_ATTRIBUTE[name] ?? name] = value;
  return VOID.has(tag) ? createElement(tag, { key, ...props }) : createElement(tag, { key, ...props }, children);
}

/**
 * Turns the API's HTML into React elements: first sanitised (see sanitize-html.ts), then walked node by node.
 *
 * Why not just dangerouslySetInnerHTML? Because then a code sample is only text inside a string. Here a <pre> can become a
 * real component (CodeBlock) with a button and state, and plain text goes through React, which escapes it.
 * `editor` says whether JavaScript and TypeScript samples use the code editor view (see usesCodeEditor).
 */
export function htmlToReact(html: string, { editor = false }: { editor?: boolean } = {}): ReactNode[] {
  const document = new DOMParser().parseFromString(sanitizeHtml(html), "text/html");
  return Array.from(document.body.childNodes).map((node, index) => convert(node, index, editor));
}
