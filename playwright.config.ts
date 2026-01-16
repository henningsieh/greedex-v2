import "dotenv/config";

import { env } from "@/env";
import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for end-to-end tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./src/__tests__/e2e",
  fullyParallel: false, // Sequential execution to prevent database conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry once locally for robustness
  workers: 1, // Always use 1 worker to prevent database race conditions
  reporter: [["html", { outputFolder: "src/__tests__/e2e/.playwright/report" }]],
  outputDir: "src/__tests__/e2e/.playwright/results",
  globalSetup: "./src/__tests__/e2e/global-setup.ts",
  use: {
    baseURL: env.NEXT_PUBLIC_BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    headless: true,
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: "bun run dev",
    url: env.NEXT_PUBLIC_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
