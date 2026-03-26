import { chromium } from "@playwright/test";

export const TEST_EMAIL = "playwright_e2e@example.com";
export const TEST_PASSWORD = "TestPassword123!";
export const AUTH_STATE_PATH = "tests/.auth-state.json";

export default async function globalSetup() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Try signing in first (user may already exist from a previous run)
  await page.goto("http://localhost:3000/authenticate");
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForTimeout(3000);

  if (!page.url().includes("dashboard")) {
    // Not logged in — register the user
    await page.goto("http://localhost:3000/authenticate?mode=register");
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL("**/dashboard**", { timeout: 15000 });
  }

  // Save authenticated session for tests to reuse
  await context.storageState({ path: AUTH_STATE_PATH });
  await browser.close();
}
