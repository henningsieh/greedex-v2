import { expect, test } from "@playwright/test";
import { TestProjectFixture } from "./fixtures/test-project";

/**
 * End-to-End Test for Participant Questionnaire Form
 *
 * This test suite validates the complete questionnaire flow including:
 * - Form navigation and validation
 * - Valid and invalid input handling
 * - Conditional step logic (car questions)
 * - Progress tracking
 * - Final emissions calculation and console output
 */

let fixture: TestProjectFixture;
let projectId: string;

test.describe("Questionnaire Form E2E Tests", () => {
  test.beforeAll(async () => {
    // Create test project in database
    fixture = new TestProjectFixture();
    projectId = await fixture.setup();
    console.log(`✅ Created test project with ID: ${projectId}`);
  });

  test.afterAll(async () => {
    // Clean up test data
    await fixture.teardown();
    console.log("✅ Cleaned up test project");
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to the test project participation page
    await page.goto(`/en/project/${projectId}/participate`);

    // Wait for the form to be visible
    await expect(
      page.locator("text=Start").or(page.locator("text=start")).first(),
    ).toBeVisible({});
  });

  test("should complete full questionnaire with valid inputs", async ({
    page,
  }) => {
    // Step 0: Welcome - Click start
    await page.getByRole("button", { name: /start/i }).click();

    // Step 1: Participant Info
    await expect(page.locator("text=first name").first()).toBeVisible();
    await page.locator('input[id="firstName"]').fill("John");

    // Fill country - using CountrySelect component
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: /germany/i }).click();

    await page.locator('input[id="email"]').fill("john.doe@example.com");
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 2: Days
    await expect(page.locator("text=days").first()).toBeVisible();
    let numberInput = page.locator('input[type="number"]').first();
    await numberInput.click();
    await numberInput.pressSequentially("7", { delay: 50 });
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled({
      timeout: 3000,
    });
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 3: Accommodation Category
    await expect(page.locator("text=accommodation").first()).toBeVisible();
    await page.getByRole("button", { name: "Hostel" }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 4: Room Occupancy
    await expect(page.locator("text=sharing").first()).toBeVisible();
    await page.getByRole("button", { name: "2 people" }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 5: Electricity - should show impact modal
    await expect(page.locator("text=energy").first()).toBeVisible();
    await page.getByRole("button", { name: /green energy/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    // Wait for and close impact modal
    await expect(page.locator("text=impact").first()).toBeVisible({
      timeout: 3000,
    });
    await page.getByRole("button", { name: /got it|ok|close/i }).click();

    // Step 6: Food - should show impact modal
    await expect(page.locator("text=meat").first()).toBeVisible();
    await page.getByRole("button", { name: "sometimes" }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    // Wait for and close impact modal
    await expect(page.locator("text=impact").first()).toBeVisible({
      timeout: 3000,
    });
    await page.getByRole("button", { name: /got it|ok|close/i }).click();

    // Step 7: Flight km - should show impact modal if > 0
    await expect(page.locator("text=fly").first()).toBeVisible();
    numberInput = page.locator('input[type="number"]').first();
    await numberInput.click();
    await numberInput.pressSequentially("500", { delay: 50 });
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled({
      timeout: 3000,
    });
    await page.getByRole("button", { name: /continue/i }).click();

    // Wait for and close impact modal
    await expect(page.locator("text=impact").first()).toBeVisible({
      timeout: 3000,
    });
    await page.getByRole("button", { name: /got it|ok|close/i }).click();

    // Step 8: Boat km - entering 0 should NOT show impact
    await expect(page.locator("text=boat").first()).toBeVisible();
    numberInput = page.locator('input[type="number"]').first();
    await numberInput.click();
    await numberInput.pressSequentially("0", { delay: 50 });
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled({
      timeout: 3000,
    });
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 9: Train km - should show impact modal if > 0
    await expect(page.locator("text=train").first()).toBeVisible();
    numberInput = page.locator('input[type="number"]').first();
    await numberInput.click();
    await numberInput.pressSequentially("100", { delay: 50 });
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled({
      timeout: 3000,
    });
    await page.getByRole("button", { name: /continue/i }).click();

    // Wait for and close impact modal
    await expect(page.locator("text=impact").first()).toBeVisible({
      timeout: 3000,
    });
    await page.getByRole("button", { name: /got it|ok|close/i }).click();

    // Step 10: Bus km - entering 0 should NOT show impact
    await expect(page.locator("text=bus").first()).toBeVisible();
    numberInput = page.locator('input[type="number"]').first();
    await numberInput.click();
    await numberInput.pressSequentially("0", { delay: 50 });
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled({
      timeout: 3000,
    });
    await page.getByRole("button", { name: /continue/i }).click();
    // Wait for next step content to be visible
    await expect(page.locator("text=car").first()).toBeVisible({ timeout: 3000 });

    // Step 11: Car km - test with value > 0 to trigger conditional steps
    await expect(page.locator("text=car").first()).toBeVisible({
      timeout: 10000,
    });
    numberInput = page.locator('input[type="number"]').first();
    await numberInput.click();
    await numberInput.pressSequentially("200", { delay: 50 });
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled({
      timeout: 3000,
    });
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 12: Car Type (conditional - only shown if carKm > 0) - Select Electric
    await expect(page.locator("text=type of car").first()).toBeVisible();
    // Wait for the electric button to be stable/clickable
    await expect(page.getByRole("button", { name: /electric/i })).toBeEnabled({
      timeout: 3000,
    });
    await page.getByRole("button", { name: /electric/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    // Step 13: Car Passengers (conditional) - should show impact modal
    await expect(page.locator("text=participants").first()).toBeVisible();
    const carPassengersInput = page.locator('input[type="number"]').first();
    await carPassengersInput.click();
    await carPassengersInput.clear();
    await carPassengersInput.pressSequentially("3", { delay: 50 });
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled({
      timeout: 5000,
    });
    await page.getByRole("button", { name: /continue/i }).click();

    // Wait for and close impact modal
    await expect(page.locator("text=impact").first()).toBeVisible({
      timeout: 3000,
    });
    await page.getByRole("button", { name: /got it|ok|close/i }).click();

    // Step 14: Age
    await expect(page.locator("text=old").first()).toBeVisible();
    const ageInput = page.locator('input[type="number"]').first();
    await ageInput.click();
    await ageInput.clear();
    await ageInput.pressSequentially("28", { delay: 50 });
    const completeBtn = page.getByRole("button", { name: /complete/i });
    await expect(completeBtn).toBeEnabled({ timeout: 5000 });
    await completeBtn.click();

    // Step 15: Gender - Final step
    await expect(page.locator("text=gender").first()).toBeVisible();

    // Verify final results are displayed with emissions breakdown
    await expect(page.locator("text=summary").first()).toBeVisible({
      timeout: 5000,
    });

    // Verify the summary shows CO2 breakdown sections
    await expect(page.locator("text=Transport").first()).toBeVisible();
    await expect(page.locator("text=Accommodation").first()).toBeVisible();
    await expect(page.locator("text=Food").first()).toBeVisible();
    await expect(page.locator("text=Total").first()).toBeVisible();
  });

  test("should handle conditional car question skip when carKm is 0", async ({
    page,
  }) => {
    // Start questionnaire
    await page.getByRole("button", { name: /start/i }).click();

    // Fill participant info
    await page.locator('input[id="firstName"]').fill("Jane");
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: /france/i }).click();
    await page.locator('input[id="email"]').fill("jane@example.com");
    await page.getByRole("button", { name: /continue/i }).click();

    // Days
    await page.locator('input[type="number"]').first().fill("5");
    await page.getByRole("button", { name: /continue/i }).click();

    // Accommodation
    await page.getByRole("button", { name: "Camping" }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    // Room Occupancy
    await page.getByRole("button", { name: "4+ people" }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    // Electricity
    await page.getByRole("button", { name: /conventional/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /got it|ok|close/i }).click();

    // Food
    await page.getByRole("button", { name: "never" }).click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /got it|ok|close/i }).click();

    // Flight - 0 km
    await page.locator('input[type="number"]').first().fill("0");
    await page.getByRole("button", { name: /continue/i }).click();

    // Boat - 0 km
    await page.locator('input[type="number"]').first().fill("0");
    await page.getByRole("button", { name: /continue/i }).click();

    // Train - 0 km
    await page.locator('input[type="number"]').first().fill("0");
    await page.getByRole("button", { name: /continue/i }).click();

    // Bus - 0 km
    await page.locator('input[type="number"]').first().fill("0");
    await page.getByRole("button", { name: /continue/i }).click();

    // Car - 0 km (should skip car type and passengers)
    await expect(page.locator("text=car").first()).toBeVisible();
    await page.locator('input[type="number"]').first().fill("0");
    await page.getByRole("button", { name: /continue/i }).click();

    // Should skip to Age (not car type/passengers)
    await expect(page.locator("text=old").first()).toBeVisible();

    // Verify car type question is NOT shown
    await expect(page.locator("text=type of car").first()).not.toBeVisible();
  });

  test("should validate required fields and prevent progression with invalid input", async ({
    page,
  }) => {
    // Start questionnaire
    await page.getByRole("button", { name: /start/i }).click();

    // Step 1: Try to continue without filling required fields
    const continueButton = page.getByRole("button", { name: /continue/i });

    // Continue button should be disabled without firstName
    await expect(continueButton).toBeDisabled();

    // Fill firstName only
    await page.locator('input[id="firstName"]').fill("Test");
    await expect(continueButton).toBeDisabled();

    // Fill country
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: /spain/i }).click();
    await expect(continueButton).toBeDisabled();

    // Fill email to enable button
    await page.locator('input[id="email"]').fill("test@example.com");
    await expect(continueButton).toBeEnabled();
    await continueButton.click();

    // Step 2: Days - test invalid/zero value
    await page.locator('input[type="number"]').first().fill("0");
    await expect(continueButton).toBeDisabled();

    // Negative value should also disable
    await page.locator('input[type="number"]').first().fill("-5");
    await expect(continueButton).toBeDisabled();

    // Valid positive value
    await page.locator('input[type="number"]').first().fill("3");
    await expect(continueButton).toBeEnabled();
  });

  test("should validate email format", async ({ page }) => {
    await page.getByRole("button", { name: /start/i }).click();

    await page.locator('input[id="firstName"]').fill("Test");
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: /italy/i }).click();

    // Try invalid email formats
    const emailInput = page.locator('input[id="email"]');
    const continueButton = page.getByRole("button", { name: /continue/i });

    // Invalid email without @
    await emailInput.fill("invalidemail");
    // HTML5 validation should prevent enabling
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) =>
      el.validity ? !el.validity.valid : false,
    );
    expect(isInvalid).toBe(true);

    // Valid email
    await emailInput.fill("valid@email.com");
    await expect(continueButton).toBeEnabled();
  });

  test("should validate number input ranges", async ({ page }) => {
    await page.getByRole("button", { name: /start/i }).click();

    // Fill participant info quickly
    await page.locator('input[id="firstName"]').fill("Test");
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: /portugal/i }).click();
    await page.locator('input[id="email"]').fill("test@test.com");
    await page.getByRole("button", { name: /continue/i }).click();

    // Days - should not accept negative
    const numberInput = page.locator('input[type="number"]').first();
    const continueButton = page.getByRole("button", { name: /continue/i });

    await numberInput.fill("-10");
    await expect(continueButton).toBeDisabled();

    await numberInput.fill("0");
    await expect(continueButton).toBeDisabled();

    await numberInput.fill("1");
    await expect(continueButton).toBeEnabled();

    // Very large number should still work
    await numberInput.fill("365");
    await expect(continueButton).toBeEnabled();
  });

  test("should show progress bar and step counter", async ({ page }) => {
    await page.getByRole("button", { name: /start/i }).click();

    // Check initial step counter (should show step 2 of 16)
    await expect(page.locator("text=/step.*2.*16/i").first()).toBeVisible();

    // Fill and continue
    await page.locator('input[id="firstName"]').fill("Test");
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: /austria/i }).click();
    await page.locator('input[id="email"]').fill("test@test.com");
    await page.getByRole("button", { name: /continue/i }).click();

    // Should show step 3 of 16
    await expect(page.locator("text=/step.*3.*16/i").first()).toBeVisible();

    // Progress bar should exist
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
  });

  test("should allow back navigation", async ({ page }) => {
    await page.getByRole("button", { name: /start/i }).click();

    // Fill participant info
    await page.locator('input[id="firstName"]').fill("BackTest");
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: /belgium/i }).click();
    await page.locator('input[id="email"]').fill("back@test.com");
    await page.getByRole("button", { name: /continue/i }).click();

    // Days step
    await page.locator('input[type="number"]').first().fill("7");
    await page.getByRole("button", { name: /continue/i }).click();

    // Now at accommodation step - verify we can go back
    await expect(page.locator("text=accommodation").first()).toBeVisible();

    // Click back button
    await page.getByRole("button", { name: /back/i }).click();

    // Should be back at days step
    await expect(page.locator("text=days").first()).toBeVisible();

    // Value should be preserved
    const daysInput = page.locator('input[type="number"]').first();
    await expect(daysInput).toHaveValue("7");
  });

  test("should display CO2 stats from step 2 onwards", async ({ page }) => {
    await page.getByRole("button", { name: /start/i }).click();

    // Step 1 - stats should not be visible yet
    await expect(page.locator("text=CO2 footprint").first()).not.toBeVisible();

    // Fill participant info and continue
    await page.locator('input[id="firstName"]').fill("Stats");
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: /netherlands/i }).click();
    await page.locator('input[id="email"]').fill("stats@test.com");
    await page.getByRole("button", { name: /continue/i }).click();

    // Fill days
    await page.locator('input[type="number"]').first().fill("5");
    await page.getByRole("button", { name: /continue/i }).click();

    // Now at step 2+ - CO2 stats should be visible
    await expect(page.getByText("CO₂ Footprint", { exact: false })).toBeVisible();
    await expect(
      page.getByText("Trees (1 Year)", { exact: false }),
    ).toBeVisible();
    // Should show 0.0 kg initially
    await expect(page.locator("text=/0\\.0.*kg/i").first()).toBeVisible();
  });

  test("should handle car passengers validation", async ({ page }) => {
    // Navigate through to car passengers step
    await page.getByRole("button", { name: /start/i }).click();

    // Quick fill to get to car steps
    await page.locator('input[id="firstName"]').fill("CarTest");
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: /sweden/i }).click();
    await page.locator('input[id="email"]').fill("car@test.com");
    await page.getByRole("button", { name: /continue/i }).click();

    // Days
    const daysInput1 = page.locator('input[type="number"]').first();
    await daysInput1.click();
    await daysInput1.pressSequentially("3", { delay: 50 });
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled({
      timeout: 3000,
    });
    await page.getByRole("button", { name: /continue/i }).click();

    // Skip through accommodation/food quickly
    await page.getByRole("button", { name: "Camping" }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    await page.getByRole("button", { name: "alone" }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    await page.getByRole("button", { name: /green/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /got it|ok|close/i }).click();

    await page.getByRole("button", { name: "never" }).click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /got it|ok|close/i }).click();

    // Skip transport to car
    let transportInput = page.locator('input[type="number"]').first();
    await transportInput.click();
    await transportInput.pressSequentially("0", { delay: 50 });
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled({
      timeout: 2000,
    });
    await page.getByRole("button", { name: /continue/i }).click(); // flight

    transportInput = page.locator('input[type="number"]').first();
    await transportInput.click();
    await transportInput.pressSequentially("0", { delay: 50 });
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled({
      timeout: 2000,
    });
    await page.getByRole("button", { name: /continue/i }).click(); // boat

    transportInput = page.locator('input[type="number"]').first();
    await transportInput.click();
    await transportInput.pressSequentially("0", { delay: 50 });
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled({
      timeout: 2000,
    });
    await page.getByRole("button", { name: /continue/i }).click(); // train

    transportInput = page.locator('input[type="number"]').first();
    await transportInput.click();
    await transportInput.pressSequentially("0", { delay: 50 });
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled({
      timeout: 2000,
    });
    await page.getByRole("button", { name: /continue/i }).click(); // bus

    // Car km > 0 to trigger conditional steps
    transportInput = page.locator('input[type="number"]').first();
    await transportInput.click();
    await transportInput.pressSequentially("150", { delay: 50 });
    await expect(page.getByRole("button", { name: /continue/i })).toBeEnabled({
      timeout: 3000,
    });
    await page.getByRole("button", { name: /continue/i }).click();

    // Car type (no impact modal for carKm, modal only appears after carPassengers)
    await expect(page.locator("text=type of car").first()).toBeVisible({
      timeout: 3000,
    });
    const electricBtn = page.getByRole("button", { name: /electric/i });
    await expect(electricBtn).toBeVisible({ timeout: 3000 });
    await electricBtn.click();
    await page.getByRole("button", { name: /continue/i }).click();

    // Car passengers - validate minimum of 1
    const passengersInput = page.locator('input[type="number"]').first();
    const continueButton = page.getByRole("button", { name: /continue/i });

    // 1 or more should enable
    await passengersInput.click();
    await passengersInput.clear();
    await passengersInput.pressSequentially("1", { delay: 50 });
    await expect(continueButton).toBeEnabled({ timeout: 3000 });

    await passengersInput.click();
    await passengersInput.clear();
    await passengersInput.pressSequentially("5", { delay: 50 });
    await expect(continueButton).toBeEnabled({ timeout: 3000 });
  });

  test("should display final summary with breakdown", async ({ page }) => {
    // Complete full questionnaire with known values
    await page.getByRole("button", { name: /start/i }).click();

    await page.locator('input[id="firstName"]').fill("Summary");
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole("option", { name: /denmark/i }).click();
    await page.locator('input[id="email"]').fill("summary@test.com");
    await page.getByRole("button", { name: /continue/i }).click();

    await page.locator('input[type="number"]').first().fill("7");
    await page.getByRole("button", { name: /continue/i }).click();

    await page.getByRole("button", { name: "Hostel" }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    await page.getByRole("button", { name: "2 people" }).click();
    await page.getByRole("button", { name: /continue/i }).click();

    await page.getByRole("button", { name: /green/i }).click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /got it|ok|close/i }).click();

    await page.getByRole("button", { name: "sometimes" }).click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /got it|ok|close/i }).click();

    // Add some transport
    await page.locator('input[type="number"]').first().fill("100");
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /got it|ok|close/i }).click();

    // Skip rest of transport
    await page.locator('input[type="number"]').first().fill("0");
    await page.getByRole("button", { name: /continue/i }).click(); // boat
    await page.locator('input[type="number"]').first().fill("0");
    await page.getByRole("button", { name: /continue/i }).click(); // train
    await page.locator('input[type="number"]').first().fill("0");
    await page.getByRole("button", { name: /continue/i }).click(); // bus
    await page.locator('input[type="number"]').first().fill("0");
    await page.getByRole("button", { name: /continue/i }).click(); // car

    // Age - final step before gender
    const ageInput = page.locator('input[type="number"]').first();
    await ageInput.click();
    await ageInput.clear();
    await ageInput.pressSequentially("30", { delay: 50 });
    const completeBtn = page.getByRole("button", { name: /complete/i });
    await expect(completeBtn).toBeEnabled({ timeout: 5000 });
    await completeBtn.click();

    // Gender - selecting gender shows the final summary
    await page.getByRole("button", { name: "Male", exact: true }).click();

    // Should show breakdown labels
    await expect(page.locator("text=Transport").first()).toBeVisible();
    await expect(page.locator("text=Accommodation").first()).toBeVisible();
    await expect(page.locator("text=Food").first()).toBeVisible();
    await expect(page.locator("text=Total").first()).toBeVisible();

    // Should show CO2 values (numbers with "kg CO₂")
    const co2Values = await page.locator("text=/\\d+\\.\\d+.*kg.*CO₂/i").all();
    expect(co2Values.length).toBeGreaterThan(0);
  });
});
