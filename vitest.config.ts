import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "apps/*/test/**/*.test.{ts,tsx}",
      "packages/*/test/**/*.test.ts",
    ],
    environment: "node",
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
    },
  },
});
