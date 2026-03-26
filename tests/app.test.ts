import { test, expect, type Page } from "@playwright/test";

const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = "TestPassword123!";
const NOTE_TITLE = `Test Note ${Date.now()}`;
const NOTE_CONTENT = "This is test note content written by Playwright.";

async function register(page: Page) {
  await page.goto("/authenticate?mode=register");
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/dashboard**", { timeout: 15000 });
}

async function login(page: Page) {
  await page.goto("/authenticate");
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard**", { timeout: 30000 });
}

// ── Auth ──────────────────────────────────────────────────────────────────────

test.describe("Auth", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("unauthenticated /dashboard redirects to /authenticate", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/authenticate/);
  });

  test("register page renders login/password fields", async ({ page }) => {
    await page.goto("/authenticate?mode=register");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  });

  test("login page renders login/password fields", async ({ page }) => {
    await page.goto("/authenticate");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("register new user → lands on dashboard", async ({ page }) => {
    await register(page);
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole("heading", { name: "My Notes" })).toBeVisible();
  });
});

// ── Notes CRUD ────────────────────────────────────────────────────────────────

test.describe("Notes CRUD", () => {
  // All tests in this suite share the same registered user created in Auth suite.
  // We log in at the start of each test.
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("dashboard shows New Note button", async ({ page }) => {
    await expect(page.getByRole("link", { name: "New Note" })).toBeVisible();
  });

  test("create a note", async ({ page }) => {
    await page.getByRole("link", { name: "New Note" }).click();
    await page.waitForURL("**/notes/new**");
    await expect(page.getByRole("heading", { name: "New Note" })).toBeVisible();

    await page.getByLabel("Title").fill(NOTE_TITLE);

    const editor = page.locator(".ProseMirror");
    await editor.click();
    await editor.type(NOTE_CONTENT);

    await page.getByRole("button", { name: "Save note" }).click();
    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    await expect(page.getByText(NOTE_TITLE)).toBeVisible();
  });

  test("view note detail page shows title", async ({ page }) => {
    await page.getByRole("link", { name: NOTE_TITLE }).click();
    await expect(page).toHaveURL(/\/notes\/.+/);
    await expect(page.getByRole("heading", { name: NOTE_TITLE })).toBeVisible();
  });

  test("edit note title", async ({ page }) => {
    // Click Edit on the first note matching our title
    const noteCard = page.locator("div").filter({ hasText: NOTE_TITLE }).first();
    await noteCard.getByRole("link", { name: "Edit", exact: true }).click();
    await page.waitForURL(/\/notes\/.+\/edit/);

    const newTitle = `${NOTE_TITLE} (edited)`;
    const titleInput = page.getByLabel("Title");
    await titleInput.clear();
    await titleInput.fill(newTitle);

    await page.getByRole("button", { name: "Save changes" }).click();
    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    await expect(page.getByText(newTitle)).toBeVisible();
  });

  test("toggle note sharing generates public URL", async ({ page }) => {
    // Open edit page for first note
    await page.getByRole("link", { name: "Edit", exact: true }).first().click();
    await page.waitForURL(/\/notes\/.+\/edit/);

    const toggle = page.locator('[aria-pressed]').first();
    const initialState = (await toggle.getAttribute("aria-pressed")) === "true";

    // Enable sharing if currently off
    if (!initialState) {
      await toggle.click();
      await page.waitForTimeout(1000);
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
    }

    // Verify public URL appears
    const urlInput = page.locator('input[readonly]');
    await expect(urlInput).toBeVisible();
    const publicUrl = await urlInput.inputValue();
    expect(publicUrl).toMatch(/\/p\/.+/);

    // Visit the public URL and check it renders
    await page.goto(publicUrl);
    await expect(page.getByText("Shared note")).toBeVisible();
  });

  test("public note is 404 after sharing disabled", async ({ page }) => {
    await page.getByRole("link", { name: "Edit", exact: true }).first().click();
    await page.waitForURL(/\/notes\/.+\/edit/);

    const toggle = page.locator('[aria-pressed]').first();

    // If already public, capture URL and then disable
    if ((await toggle.getAttribute("aria-pressed")) === "true") {
      const publicUrl = await page.locator('input[readonly]').inputValue();

      await toggle.click();
      await page.waitForTimeout(1000);
      await expect(toggle).toHaveAttribute("aria-pressed", "false");

      // The public URL should now return 404
      const res = await page.request.get(publicUrl);
      expect(res.status()).toBe(404);
    } else {
      // Sharing was already off — just verify the URL input is hidden
      await expect(page.locator('input[readonly]')).not.toBeVisible();
    }
  });

  test("delete a single note via confirm dialog", async ({ page }) => {
    const titleEl = page.getByRole("link").filter({ hasText: /Test Note/ }).first();
    const titleText = await titleEl.textContent() ?? "";

    const noteCard = page.locator("div").filter({ has: titleEl }).first();
    await noteCard.getByRole("button", { name: "Delete" }).click();

    // Confirm dialog
    await expect(page.getByRole("button", { name: "Delete" }).last()).toBeVisible();
    await page.getByRole("button", { name: "Delete" }).last().click();

    await page.waitForTimeout(1000);
    await expect(page.getByRole("link", { name: titleText })).not.toBeVisible();
  });
});

// ── Bulk delete ───────────────────────────────────────────────────────────────

test.describe("Bulk delete", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("select mode → select all → bulk delete", async ({ page }) => {
    // Ensure at least one note exists
    const hasNotes = (await page.getByRole("link", { name: "Edit", exact: true }).count()) > 0;
    if (!hasNotes) {
      await page.getByRole("link", { name: "New Note" }).click();
      await page.waitForURL("**/notes/new**");
      await page.getByLabel("Title").fill("Bulk Delete Note");
      await page.locator(".ProseMirror").click();
      await page.locator(".ProseMirror").type("content");
      await page.getByRole("button", { name: "Save note" }).click();
      await page.waitForURL("**/dashboard**");
    }

    await page.getByRole("button", { name: "Select" }).click();
    await page.getByRole("button", { name: "Select all" }).click();

    const deleteBtn = page.getByRole("button", { name: /Delete \(/ });
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Confirm dialog
    await page.getByRole("button", { name: "Delete" }).last().click();
    await page.waitForTimeout(2000);

    // No notes remain
    await expect(page.getByRole("link", { name: "Edit", exact: true })).not.toBeVisible();
  });
});

// ── Sign out ──────────────────────────────────────────────────────────────────

test.describe("Sign out", () => {
  test("sign out clears session", async ({ page }) => {
    await login(page);
    const signOutBtn = page.getByRole("button", { name: /sign out/i });
    await expect(signOutBtn).toBeVisible();
    await signOutBtn.click();
    await page.waitForURL(/authenticate/, { timeout: 10000 });
    await expect(page).not.toHaveURL(/dashboard/);
  });
});
