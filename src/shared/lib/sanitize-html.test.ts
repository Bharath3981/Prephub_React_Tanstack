import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "@/shared/lib/sanitize-html";

// The body of an entry is HTML from the server. These are the attacks it must survive (XSS) and the things it must keep.
describe("sanitizeHtml", () => {
  it("removes script tags and inline event handlers", () => {
    const clean = sanitizeHtml('<p onclick="steal()">hi</p><script>steal()</script><img src="x" onerror="steal()">');
    expect(clean).not.toContain("script");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("onerror");
    expect(clean).toContain("hi");
  });

  it("removes javascript: links and iframes", () => {
    const clean = sanitizeHtml('<a href="javascript:steal()">x</a><iframe src="https://evil.example"></iframe>');
    expect(clean).not.toContain("javascript:");
    expect(clean).not.toContain("iframe");
  });

  it("keeps the language class of a code block but drops any other class", () => {
    const clean = sanitizeHtml('<pre><code class="language-js">a</code></pre><p class="fixed inset-0">b</p>');
    expect(clean).toContain('class="language-js"');
    expect(clean).not.toContain("fixed");
  });

  it("opens links to other sites in a new tab without giving them access to ours", () => {
    const clean = sanitizeHtml('<a href="https://example.com">x</a><a href="/react">y</a>');
    expect(clean).toContain('rel="noopener noreferrer"');
    expect(clean).toContain('target="_blank"');
    expect(clean).toContain('<a href="/react">');
  });
});
