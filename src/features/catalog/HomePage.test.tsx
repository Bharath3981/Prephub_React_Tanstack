import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HomePage } from "@/features/catalog/HomePage";
import { renderPage } from "@/test/render";
import { api, fail, http, ok } from "@/test/api";
import { server } from "@/test/server";

const topics = [
  { name: "React", slug: "react", description: "UI library", sectionCount: 2 },
  { name: "JavaScript", slug: "javascript", description: null, sectionCount: 1 },
];

describe("HomePage", () => {
  it("shows the skeleton first, then the topics", async () => {
    server.use(http.get(api("/delivery/categories"), () => ok({ categories: topics })));
    renderPage(<HomePage />);

    expect(screen.getByText("Loading topics...")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /React/ })).toHaveAttribute("href", "/react");
    expect(screen.getByRole("link", { name: /JavaScript/ })).toBeInTheDocument();
    expect(screen.queryByText("Loading topics...")).not.toBeInTheDocument();
  });

  it("shows an error with Try again, and recovers when the retry works", async () => {
    let calls = 0;
    server.use(
      http.get(api("/delivery/categories"), () => {
        calls += 1;
        return calls === 1 ? fail(500, "INTERNAL", "Server exploded") : ok({ categories: topics });
      }),
    );
    renderPage(<HomePage />);

    expect(await screen.findByText("Server exploded")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("link", { name: /React/ })).toBeInTheDocument();
    expect(calls).toBe(2);
  });

  it("serves a second visit from the cache: no second request", async () => {
    let calls = 0;
    server.use(
      http.get(api("/delivery/categories"), () => {
        calls += 1;
        return ok({ categories: topics });
      }),
    );
    const first = renderPage(<HomePage />);
    await screen.findByRole("link", { name: /React/ });
    first.unmount();

    renderPage(<HomePage />, { client: first.client }); // the same QueryClient: the visitor came back
    expect(screen.getByRole("link", { name: /React/ })).toBeInTheDocument(); // there at once, no skeleton
    expect(calls).toBe(1);
  });
});
