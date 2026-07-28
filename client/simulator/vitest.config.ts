import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// Client-side unit tests. The seams worth testing here are pure logic — the
// message-protocol boundary parser and the datapath edge kernel — so they run
// in a plain Node environment with no browser DOM, mirroring the root
// `vitest.config.ts`. Rendering the React tree is deliberately out of scope
// (see the client-view-seam spec's Testing Decisions), so no jsdom is needed.
// The `@` path alias matches the app's `tsconfig`/`vite.config` so tests import
// source modules the same way the app does.
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
