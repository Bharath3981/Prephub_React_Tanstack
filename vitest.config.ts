import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Tests run in jsdom (a fake browser) with the same plugins and "@" alias as the app.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      environmentOptions: { jsdom: { url: "http://localhost/" } },
      setupFiles: ["./src/test/setup.ts"],
      css: false,
      restoreMocks: true,
    },
  }),
);
