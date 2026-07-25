import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// Pure-logic unit tests and the golden-output CPU integration tests run in a
// plain Node environment with no VS Code extension host. Production modules on
// the CPU import path statically import `vscode` (which only exists inside the
// host), so it is aliased to a minimal stub for headless runs.
export default defineConfig({
  resolve: {
    alias: {
      vscode: resolve(__dirname, "test/vscode-stub.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
