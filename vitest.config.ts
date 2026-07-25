import { defineConfig } from "vitest/config";

// Pure-logic unit tests only: they run in a plain Node environment with no
// VS Code extension host. The golden-output CPU integration tests (a later
// ticket) also run headless under this same config.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
