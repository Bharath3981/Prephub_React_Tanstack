import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TagPage } from "@/features/catalog/TagPage";
import { catalogKeys } from "@/features/catalog/queries";
import { api, fail, http, ok } from "@/test/api";
import { listPage } from "@/test/factories";
import { createTestQueryClient, renderPage } from "@/test/render";
import { server } from "@/test/server";

const routes = [{ path: "/tags/:tag", element: <TagPage /> }];

describe("TagPage", () => {
  it("shows the tag and its entries", async () => {
    server.use(
      http.get(api("/delivery/tags/closures"), () => {
        const { entries, meta } = listPage(1, 2);
        return ok({ tag: { name: "Closures", slug: "closures", entryCount: 2 }, entries }, meta);
      }),
    );
    renderPage(routes, { path: "/tags/closures" });
    expect(await screen.findByRole("heading", { name: "#Closures" })).toBeInTheDocument();
    expect(screen.getByText("2 entries use this tag.")).toBeInTheDocument();
    expect(await screen.findByText("Question 1")).toBeInTheDocument();
  });

  it("draws the header from the cached tag list while the entries load", async () => {
    const client = createTestQueryClient();
    client.setQueryData(catalogKeys.tagList(1), { tags: [{ name: "Hooks", slug: "hooks", entryCount: 7 }], meta: { page: 1, limit: 100, total: 1, totalPages: 1 } });
    server.use(http.get(api("/delivery/tags/hooks"), () => new Promise(() => {}))); // never answers: only the cache can fill the header
    renderPage(routes, { path: "/tags/hooks", client });
    expect(screen.getByRole("heading", { name: "#Hooks" })).toBeInTheDocument();
    expect(screen.getByText("7 entries use this tag.")).toBeInTheDocument();
  });

  it("shows the not-found page for an unknown tag, after a single request", async () => {
    let calls = 0;
    server.use(
      http.get(api("/delivery/tags/nope"), () => {
        calls += 1;
        return fail(404, "NOT_FOUND", "Tag not found");
      }),
    );
    renderPage(routes, { path: "/tags/nope" });
    expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(calls).toBe(1);
  });
});
