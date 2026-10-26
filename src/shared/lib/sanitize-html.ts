import DOMPurify from "dompurify";

/**
 * Makes HTML from the server safe to put into the page.
 *
 * The API builds `bodyHtml` from markdown that an admin writes, so today it is trusted. We still clean it before showing it:
 * an account could be stolen, a markdown library could have a bug, or one day someone else may write content. If one
 * `<script>` or `onerror=` ever got through, it would run on our origin with the visitor's cookies (XSS).
 *
 * It is an ALLOW-LIST: only the tags and attributes below survive. Everything else (scripts, iframes, forms, style
 * attributes, event handlers such as onclick, javascript: links, data-* attributes) is removed.
 */
const ALLOWED_TAGS = [
  "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "sub", "sup", "kbd", "code", "pre", "blockquote",
  "ul", "ol", "li", "h2", "h3", "h4", "h5", "h6", "a", "img",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "details", "summary",
];
const ALLOWED_ATTR = ["href", "title", "alt", "src", "width", "height", "colspan", "rowspan", "class", "rel", "target"];

// `class` is kept only for code languages (language-js). A free class could use our own styles to cover the page.
const LANGUAGE_CLASS = /^language-[\w+-]+$/;

DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
  if (data.attrName === "class" && !data.attrValue.split(/\s+/).every((name) => LANGUAGE_CLASS.test(name))) data.keepAttr = false;
});

// A link to another site opens in a new tab and cannot reach back into ours through window.opener.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    const href = node.getAttribute("href") ?? "";
    if (/^https?:\/\//i.test(href)) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    } else {
      node.removeAttribute("target");
      node.removeAttribute("rel");
    }
  }
});

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR, ALLOW_DATA_ATTR: false });
}
