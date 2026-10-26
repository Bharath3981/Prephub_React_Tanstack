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
