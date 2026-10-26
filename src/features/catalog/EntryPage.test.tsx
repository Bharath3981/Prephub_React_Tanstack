import { screen } from "@testing-library/react";
import { delay } from "msw";
import { Outlet } from "react-router";
import { describe, expect, it } from "vitest";
import { EntryPage } from "@/features/catalog/EntryPage";
import { entryQueries } from "@/features/catalog/queries";
import type { SectionContext } from "@/features/catalog/SectionLayout";
import { api, fail, http, ok } from "@/test/api";
import { createTestQueryClient, renderPage } from "@/test/render";
import { server } from "@/test/server";

const context: SectionContext = {
  category: { name: "React", slug: "react", description: null, sectionCount: 1, sections: [] },
  section: { name: "Interview Questions", slug: "q", description: null, kind: "QUESTION", entryCount: 1 },
  entryOrder: null,
};
const detail = {
  slug: "useref", group: null, title: "What is useRef?", summary: "A box that survives renders.", kind: "QUESTION" as const, difficulty: "EASY" as const, tags: [], categorySlug: "react", sectionSlug: "q",
  id: "1", publishedAt: null, updatedAt: "2026-10-01T00:00:00.000Z", bodyHtml: "<p>The full answer.</p><script>alert(1)</script>", meta: {},
  category: { name: "React", slug: "react" }, section: { name: "Interview Questions", slug: "q", kind: "QUESTION" as const }, related: [],
};
const { bodyHtml: _body, ...listRow } = detail;

// EntryPage reads the topic and section from the layout above it (the outlet context): this stands in for SectionLayout.
const routes = [{ element: <Outlet context={context} />, children: [{ path: "/react/q/:entry", element: <EntryPage /> }] }];

describe("EntryPage", () => {
  it("shows the list row from the cache while the entry loads, then the sanitised body", async () => {
    const client = createTestQueryClient();
    // The visitor came from a list page: its row is in the cache.
    client.setQueryData(entryQueries.list("react", "q", { page: 1, limit: 20 }).queryKey, { entries: [listRow], meta: { page: 1, limit: 20, total: 1, totalPages: 1 } });
    server.use(
      http.get(api("/delivery/categories/react/sections/q/entries/useref"), async () => {
        await delay(60);
        return ok({ entry: detail });
      }),
    );
    renderPage(routes, { path: "/react/q/useref", client });

    // At once: title and summary from the cached row, and the loading body.
    expect(screen.getByRole("heading", { name: "What is useRef?" })).toBeInTheDocument();
    expect(screen.getByText("A box that survives renders.")).toBeInTheDocument();
    expect(screen.getByText("Loading the entry...")).toBeInTheDocument();

    // Then the full entry. The <script> in the body must be gone.
    expect(await screen.findByText("The full answer.")).toBeInTheDocument();
    expect(document.querySelector(".entry-body script")).toBeNull();
  });

  it("shows the not-found page when the API answers 404", async () => {
    server.use(http.get(api("/delivery/categories/react/sections/q/entries/nope"), () => fail(404, "NOT_FOUND", "Entry not found")));
    renderPage(routes, { path: "/react/q/nope" });
    expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument();
  });

  it("shows an error with Try again for a server error", async () => {
    server.use(http.get(api("/delivery/categories/react/sections/q/entries/boom"), () => fail(500, "INTERNAL", "Server exploded")));
    renderPage(routes, { path: "/react/q/boom" });
    expect(await screen.findByText("Server exploded")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
