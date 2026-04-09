import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: "./playwright",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"]],
  snapshotPathTemplate: path.join(packageRoot, "playwright", "__screenshots__", "{testFileName}", "{arg}{ext}"),
  use: {
    baseURL: "http://127.0.0.1:4174",
    colorScheme: "light",
    viewport: { width: 1600, height: 900 },
    trace: "retain-on-failure"
  },
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.01
    }
  },
  webServer: {
    command: "pnpm exec vite --config playwright.vite.config.ts",
    cwd: packageRoot,
    url: "http://127.0.0.1:4174/playwright/harness.html",
    reuseExistingServer: !process.env.CI,
    timeout: 300_000
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1600, height: 900 }
      }
    }
  ]
});
