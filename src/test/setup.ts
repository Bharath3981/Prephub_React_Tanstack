import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "@/test/server";

// The app calls fetch("/api/v1/..."): a relative URL, which a browser resolves against the page. Node's fetch cannot,
// so every relative URL gets the test origin first. The fake API (msw) then sees a normal absolute URL.
const realFetch = globalThis.fetch;
vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => realFetch(typeof input === "string" && input.startsWith("/") ? `http://localhost${input}` : input, init));

beforeAll(() => server.listen({ onUnhandledFrame: "error" })); // a request nobody expected fails the test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

// jsdom has no layout engine, so it has no IntersectionObserver or ResizeObserver. These stand-ins let a test decide WHEN an
// element "comes into view": `MockIntersectionObserver.trigger()` plays the browser telling the app that the sentinel is visible.
export class MockIntersectionObserver {
  static instances = new Set<MockIntersectionObserver>();
  constructor(private callback: IntersectionObserverCallback) {
    MockIntersectionObserver.instances.add(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {
    MockIntersectionObserver.instances.delete(this);
  }
  takeRecords() {
    return [];
  }
  static trigger() {
    for (const instance of MockIntersectionObserver.instances) instance.callback([{ isIntersecting: true } as IntersectionObserverEntry], instance as unknown as IntersectionObserver);
  }
}
vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);
afterEach(() => MockIntersectionObserver.instances.clear());

// jsdom does not implement scrolling.
Element.prototype.scrollIntoView = () => {};
window.scrollTo = () => {};
