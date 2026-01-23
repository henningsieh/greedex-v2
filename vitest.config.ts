/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    // Increase test timeout to 20 seconds for Next.js dev server startup
    testTimeout: 20_000,
    hookTimeout: 20_000,
    // Only include explicit test patterns (optional), and explicitly exclude docs/clickdummy
    include: [
      "src/**/*.{test,spec}.{ts,tsx,js,jsx}",
      "test/**/*.test.{ts,tsx,js,jsx}",
    ],
    exclude: [
      ".next",
      "node_modules",
      "docs/**",
      "dist",
      "build",
      "public",
      "coverage",
      "storybook-static",
      "src/__tests__/e2e/**", // Exclude Playwright e2e tests
    ],
  },
  // Prevent Vite's file watcher from watching the large docs folder (improves watch performance)
  server: {
    watch: {
      ignored: [
        "**/.next/**",
        "**/node_modules/**",
        "**/docs/**",
        "**/dist/**",
        "**/build/**",
        "**/public/**",
        "**/coverage/**",
        "**/storybook-static/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
