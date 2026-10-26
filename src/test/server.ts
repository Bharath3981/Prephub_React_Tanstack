import { setupServer } from "msw/node";

/** A fake API for the tests. Each test adds its own handlers with `server.use(...)`; nothing reaches the real API. */
export const server = setupServer();
