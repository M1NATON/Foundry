import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Компоненты веба тестируются рендером в строку (react-dom/server), поэтому
  // JSX нужно транспилировать: tsconfig веба оставляет его нетронутым для Next.
  oxc: { jsx: { runtime: "automatic" } },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./apps/web/src", import.meta.url)),
    },
  },
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
