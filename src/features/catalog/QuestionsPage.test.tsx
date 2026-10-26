import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { QuestionsPage } from "@/features/catalog/QuestionsPage";
import { api, http, ok } from "@/test/api";
import { categoriesAnswer, listPage } from "@/test/factories";
import { renderPage } from "@/test/render";
import { server } from "@/test/server";
import { MockIntersectionObserver } from "@/test/setup";

/** A fake /delivery/questions that remembers every URL it was asked for. */
function fakeQuestions(total: number) {
  const requests: URL[] = [];
  server.use(
    http.get(api("/delivery/categories"), () => ok(categoriesAnswer)),
    http.get(api("/delivery/questions"), ({ request }) => {
      const url = new URL(request.url);
      requests.push(url);
      const page = Number(url.searchParams.get("page") ?? 1);
      const { entries, meta } = listPage(page, total);
      return ok({ entries }, meta);
    }),
  );
  return requests;
}

describe("QuestionsPage, numbered pages", () => {
  it("shows the first page with the topic name on each card", async () => {
    fakeQuestions(45);
    renderPage(<QuestionsPage />, { path: "/questions" });
    expect(await screen.findByText("Question 1")).toBeInTheDocument();
    expect(screen.getByText("Showing 1 to 20 of 45")).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText("React").length).toBeGreaterThan(0)); // the badge, from the categories list
  });

  it("puts the filters in the request", async () => {
    const requests = fakeQuestions(45);
    renderPage(<QuestionsPage />, { path: "/questions?difficulty=HARD&category=react&page=2" });
    expect(await screen.findByText("Question 21")).toBeInTheDocument();
    const first = requests[0].searchParams;
    expect(first.get("difficulty")).toBe("HARD");
    expect(first.get("category")).toBe("react");
    expect(first.get("page")).toBe("2");
  });

  it("prefetches the next page while the current one is shown", async () => {
    const requests = fakeQuestions(45);
    renderPage(<QuestionsPage />, { path: "/questions" });
    await screen.findByText("Question 1");
    await waitFor(() => expect(requests.map((url) => url.searchParams.get("page"))).toEqual(["1", "2"]));
  });
});

describe("QuestionsPage, infinite list", () => {
  it("loads the next page when the sentinel comes into view, and stops at the last page", async () => {
    const requests = fakeQuestions(45); // 3 pages: 20 + 20 + 5
    renderPage(<QuestionsPage />, { path: "/questions?view=infinite" });
    expect(await screen.findByText("Loaded 20 of 45")).toBeInTheDocument();

    act(() => MockIntersectionObserver.trigger()); // the browser says: the sentinel is on screen
    expect(await screen.findByText("Loaded 40 of 45")).toBeInTheDocument();
    act(() => MockIntersectionObserver.trigger());
    expect(await screen.findByText("Loaded 45 of 45")).toBeInTheDocument();

    expect(screen.getByText("That is every question.")).toBeInTheDocument();
    expect(requests.map((url) => url.searchParams.get("page"))).toEqual(["1", "2", "3"]); // each page once, none after the last
  });

  it("has a Load more button as well", async () => {
    fakeQuestions(45);
    renderPage(<QuestionsPage />, { path: "/questions?view=infinite" });
    await screen.findByText("Loaded 20 of 45");
    await userEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(await screen.findByText("Loaded 40 of 45")).toBeInTheDocument();
  });

  it("switches between the virtual list and the plain list", async () => {
    fakeQuestions(45);
    renderPage(<QuestionsPage />, { path: "/questions?view=infinite" });
    await screen.findByText("Loaded 20 of 45");
    expect(document.querySelector("[data-testid=virtual-list]")).not.toBeNull();

    await userEvent.click(screen.getByRole("checkbox", { name: /Virtualise/ }));
    await waitFor(() => expect(document.querySelectorAll("ul.space-y-3 > li").length).toBe(20)); // the plain list renders every loaded row
    expect(document.querySelector("[data-testid=virtual-list]")).toBeNull();
  });
});
