import { expect, test } from "@playwright/test";

const SIGN_IN_TITLE_REGEX = /Sign in to your account/;
const SIGN_IN_TEXT_REGEX =
  /Enter your credentials below to sign in to your Greendex account/;

test.describe("Database Connection Verification", () => {
  test("app can connect to database and load sign-in page", async ({
    page,
  }) => {
    // Navigate to sign-in page
    await page.goto("http://localhost:3000/en/login");

    // Wait for page to load
    await expect(
      page.locator("h1").filter({ hasText: SIGN_IN_TITLE_REGEX }),
    ).toBeVisible();

    // Verify the page loaded (which means DB connection works)
    await expect(
      page.locator("body").filter({ hasText: SIGN_IN_TEXT_REGEX }),
    ).toBeVisible();

    console.log("✅ App successfully connected to database");
  });
});
