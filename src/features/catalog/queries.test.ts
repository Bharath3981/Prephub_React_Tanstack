import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { catalogKeys, entryQueries, findCachedEntrySummary, keepPageInSection } from "@/features/catalog/queries";
import type { EntriesPage, EntrySummary } from "@/features/catalog/types";

const row = (slug: string): EntrySummary => ({ slug, group: null, title: slug, summary: null, kind: "QUESTION", difficulty: null, tags: [], categorySlug: "react", sectionSlug: "q" });
const page = (...slugs: string[]): EntriesPage => ({ entries: slugs.map(row), meta: { page: 1, limit: 20, total: slugs.length, totalPages: 1 } });

describe("query keys", () => {
  it("are built from general to specific, so one prefix matches a group", () => {
    expect(catalogKeys.categoryList()).toEqual(["catalog", "categories", "list"]);
    expect(catalogKeys.categoryDetail("react")).toEqual(["catalog", "categories", "detail", "react"]);
    expect(catalogKeys.categoryDetail("react").slice(0, 2)).toEqual(catalogKeys.categories());
  });

  it("treat an empty or blank search like no search: one cache entry, not three", () => {
    const keys = [undefined, "", "   "].map((search) => JSON.stringify(entryQueries.list("react", "q", { page: 1, search }).queryKey));
    expect(new Set(keys).size).toBe(1);
  });
});

describe("findCachedEntrySummary", () => {
  it("finds the list row of an entry in any cached page of its section", () => {
    const client = new QueryClient();
    client.setQueryData(entryQueries.list("react", "q", { page: 2 }).queryKey, page("a", "b"));
    expect(findCachedEntrySummary(client, "react", "q", "b")?.slug).toBe("b");
    expect(findCachedEntrySummary(client, "react", "q", "zzz")).toBeUndefined();
    expect(findCachedEntrySummary(client, "react", "other-section", "b")).toBeUndefined();
  });

  it("does not trip over opened entries stored under the same section prefix", () => {
    const client = new QueryClient();
    client.setQueryData(catalogKeys.entryDetail("react", "q", "a"), { slug: "a", bodyHtml: "<p>x</p>" }); // a full entry has no `entries` array
    expect(findCachedEntrySummary(client, "react", "q", "a")).toBeUndefined();
  });
});

describe("keepPageInSection", () => {
  const previousKey = entryQueries.list("react", "q", { page: 1 }).queryKey;
  const old = page("a");

  it("keeps the previous page while the next page of the SAME section loads", () => {
    expect(keepPageInSection("react", "q")(old, { queryKey: previousKey })).toBe(old);
  });

  it("shows nothing (the skeleton) when the previous page belongs to another section", () => {
    expect(keepPageInSection("react", "concepts")(old, { queryKey: previousKey })).toBeUndefined();
    expect(keepPageInSection("react", "q")(undefined, undefined)).toBeUndefined();
  });
});
