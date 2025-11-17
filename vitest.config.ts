/// <reference types="vitest" />

import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // Only include explicit test patterns (optional), and explicitly exclude docs/clickdummy
    include: [
      "src/**/*.{test,spec}.{ts,tsx,js,jsx}",
      "test/**/*.test.{ts,tsx,js,jsx}",
    ],
    exclude: [
      "node_modules",
      "dist",
      "build",
      "public",
      "docs/**",
      "docs/greendex-clickdummy/**",
      "docs/clickdummy/**",
      "docs/greendex-clickdummy/build/**",
    ],
  },
  // Prevent Vite's file watcher from watching the large docs folder (improves watch performance)
  server: {
    watch: {
      ignored: [
        "**/docs/**",
        "**/docs/greendex-clickdummy/**",
        "**/docs/clickdummy/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
