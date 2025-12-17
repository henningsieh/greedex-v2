import "dotenv/config";
import { chromium, type FullConfig } from "@playwright/test";
import { env } from "@/env";

/**
 * Global setup for Playwright tests
 * This runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  // Verify server is running
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    const baseURL = config.projects[0].use.baseURL || env.NEXT_PUBLIC_BASE_URL;
    await page.goto(baseURL, { waitUntil: "networkidle", timeout: 30000 });
    console.log("✅ Server is running and accessible");
  } catch (error) {
    console.error("❌ Server is not accessible:", error);
    throw new Error(
      "Server is not running. Please start it with `bun run dev` before running e2e tests.",
    );
  } finally {
    await browser.close();
  }
}

export default globalSetup;
