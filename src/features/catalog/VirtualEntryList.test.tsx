import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { VirtualEntryList } from "@/features/catalog/VirtualEntryList";
import { entry } from "@/test/factories";

describe("VirtualEntryList", () => {
  it("renders only a window of a long list, inside a box as tall as the whole list", async () => {
    // jsdom has no layout (every element measures 0 px): give each row a real height.
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ x: 0, y: 0, top: 0, left: 0, right: 600, bottom: 150, width: 600, height: 150, toJSON: () => ({}) });
    const entries = Array.from({ length: 1000 }, (_, i) => entry(i + 1));

    const { container } = render(
      <MemoryRouter>
        <VirtualEntryList entries={entries} />
      </MemoryRouter>,
    );

    const rendered = container.querySelectorAll("li[data-index]").length;
    expect(rendered).toBeGreaterThan(0);
    expect(rendered).toBeLessThan(200); // a window, not all 1000
    expect(parseInt((container.querySelector("ul") as HTMLElement).style.height)).toBeGreaterThan(50_000); // but the scroll height is that of every row
  });
});
