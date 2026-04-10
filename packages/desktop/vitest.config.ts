import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@zuam\/shared$/,
        replacement: resolve(__dirname, "../shared/src/index.ts")
      },
      {
        find: /^@zuam\/shared\/(.*)$/,
        replacement: resolve(__dirname, "../shared/src/$1")
      }
    ]
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["playwright/**", "**/node_modules/**", "**/dist/**", "**/dist-electron/**"]
  }
});
