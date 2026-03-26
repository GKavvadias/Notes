import { test, expect } from "@playwright/test";

// These tests run without any auth session — they test the auth UI directly.

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});

test("unauthenticated /dashboard redirects to /authenticate", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/authenticate/);
});

test("login page shows email and password fields", async ({ page }) => {
  await page.goto("/authenticate");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("register page shows email and password fields", async ({ page }) => {
  await page.goto("/authenticate?mode=register");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
});

test("login with valid credentials reaches dashboard", async ({ page }) => {
  // The globalSetup already ensured this user exists
  await page.goto("/authenticate");
  await page.getByLabel("Email").fill("playwright_e2e@example.com");
  await page.getByLabel("Password").fill("TestPassword123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard**", { timeout: 20000 });
  await expect(page.getByRole("heading", { name: "My Notes" })).toBeVisible();
});

test("login with wrong password shows error", async ({ page }) => {
  await page.goto("/authenticate");
  await page.getByLabel("Email").fill("playwright_e2e@example.com");
  await page.getByLabel("Password").fill("WrongPassword999!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toBeVisible({ timeout: 10000 });
});
