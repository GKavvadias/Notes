/**
 * Feature tests — all tests use a pre-authenticated session
 * loaded from tests/.auth-state.json (created by globalSetup).
 *
 * State is stored at the describe level (computed once at module evaluation)
 * so it survives worker restarts between test failures.
 */
import { test, expect, type Page } from "@playwright/test";
import { AUTH_STATE_PATH } from "./global-setup";

// ── Dashboard ─────────────────────────────────────────────────────────────────

test("dashboard loads and shows New Note button", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "My Notes" })).toBeVisible();
  await expect(page.getByRole("link", { name: "New Note" })).toBeVisible();
});

// ── Editor toolbar ────────────────────────────────────────────────────────────

test("editor toolbar Bold toggles on text selection", async ({ page }) => {
  await page.goto("/notes/new");

  const editor = page.locator(".ProseMirror");
  await expect(editor).toBeVisible({ timeout: 10000 });
  await editor.click();
  await editor.type("bold test");

  // Select all using keyboard shortcut so editor retains focus & selection
  await editor.press("Control+a");
  // Toggle bold via keyboard shortcut (keeps focus, preserves selection)
  await editor.press("Control+b");

  // aria-pressed reflects editor.isActive("bold") which is true with selection
  await expect(page.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");

  // Toggle off
  await editor.press("Control+b");
  await expect(page.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "false");
});

// ── Full CRUD + Sharing workflow ──────────────────────────────────────────────
//
// Variables are computed at describe evaluation time (before any test runs),
// so they are stable even if the worker is restarted after a test failure.

test.describe.serial("Notes CRUD + Sharing", () => {
  const noteTitle = `Playwright Note ${Date.now()}`;
  const editedTitle = `${noteTitle} (edited)`;

  // Helper: navigate to dashboard and click Edit for a given note title
  async function openEditPage(page: Page, title: string) {
    await page.goto("/dashboard");
    // Go up 2 levels from title <a> to reach the note card div
    const noteCard = page
      .getByRole("link", { name: title, exact: true })
      .locator("xpath=../..");
    await noteCard.getByRole("link", { name: "Edit", exact: true }).click();
    await page.waitForURL(/\/notes\/.+\/edit/, { timeout: 10000 });
  }

  // Create the note used by all tests in this group
  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: AUTH_STATE_PATH });
    const page = await ctx.newPage();

    await page.goto("http://localhost:3000/notes/new");
    await expect(page.getByLabel("Title")).toBeVisible({ timeout: 15000 });
    await page.getByLabel("Title").fill(noteTitle);
    await page.locator(".ProseMirror").click();
    await page.locator(".ProseMirror").type("Test content from Playwright.");
    await page.getByRole("button", { name: "Save note" }).click();
    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    await ctx.close();
  });

  test("new note appears in dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: noteTitle, exact: true })).toBeVisible();
  });

  test("view note shows correct title", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: noteTitle, exact: true }).click();
    await page.waitForURL(/\/notes\/.+/, { timeout: 10000 });
    expect(page.url()).not.toMatch(/\/edit$/);
    await expect(page.getByRole("heading", { name: noteTitle })).toBeVisible();
  });

  test("edit note title", async ({ page }) => {
    await openEditPage(page, noteTitle);
    await expect(page.getByRole("heading", { name: "Edit Note" })).toBeVisible();

    const titleInput = page.getByLabel("Title");
    await titleInput.clear();
    await titleInput.fill(editedTitle);

    await page.getByRole("button", { name: "Save changes" }).click();
    await page.waitForURL("**/dashboard**", { timeout: 15000 });
    await expect(page.getByRole("link", { name: editedTitle, exact: true })).toBeVisible();
  });

  test("toggle sharing ON generates a public URL", async ({ page }) => {
    await openEditPage(page, editedTitle);

    const toggle = page.getByRole("button", { name: "Toggle public sharing" });
    await expect(toggle).toBeVisible({ timeout: 10000 });

    // Make sure sharing is OFF first
    if ((await toggle.getAttribute("aria-pressed")) === "true") {
      await toggle.click();
      await page.waitForTimeout(1000);
    }
    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    await toggle.click();
    await page.waitForTimeout(1500);
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    const urlInput = page.locator('input[readonly]');
    await expect(urlInput).toBeVisible();
    const publicUrl = await urlInput.inputValue();
    expect(publicUrl).toMatch(/\/p\/.+/);
  });

  test("public note page renders note content", async ({ page }) => {
    await openEditPage(page, editedTitle);

    const urlInput = page.locator('input[readonly]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    const publicUrl = await urlInput.inputValue();

    await page.goto(publicUrl);
    await expect(page.getByText("Shared note")).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("toggle sharing OFF hides URL and 404s public page", async ({ page }) => {
    await openEditPage(page, editedTitle);

    const toggle = page.getByRole("button", { name: "Toggle public sharing" });
    await expect(toggle).toBeVisible({ timeout: 10000 });

    const urlInput = page.locator('input[readonly]');
    await expect(urlInput).toBeVisible({ timeout: 5000 });
    const publicUrl = await urlInput.inputValue();

    await toggle.click();
    await page.waitForTimeout(1500);
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(urlInput).not.toBeVisible();

    const res = await page.request.get(publicUrl);
    expect(res.status()).toBe(404);
  });

  test("delete note via confirm dialog", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: editedTitle, exact: true })).toBeVisible();

    const noteCard = page
      .getByRole("link", { name: editedTitle, exact: true })
      .locator("xpath=../..");
    await noteCard.getByRole("button", { name: "Delete" }).click();

    // Confirm dialog should appear
    await expect(page.getByText(/permanently deleted/)).toBeVisible();
    await page.getByTestId("confirm-delete-btn").click();

    await page.waitForTimeout(1500);
    await expect(page.getByRole("link", { name: editedTitle, exact: true })).not.toBeVisible();
  });
});

// ── Bulk delete ───────────────────────────────────────────────────────────────

test.describe.serial("Bulk delete", () => {
  const bulkTitles = [`Bulk A ${Date.now()}`, `Bulk B ${Date.now() + 1}`];

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: AUTH_STATE_PATH });
    const page = await ctx.newPage();

    for (const title of bulkTitles) {
      await page.goto("http://localhost:3000/notes/new");
      await expect(page.getByLabel("Title")).toBeVisible({ timeout: 15000 });
      await page.getByLabel("Title").fill(title);
      await page.locator(".ProseMirror").click();
      await page.locator(".ProseMirror").type("bulk content");
      await page.getByRole("button", { name: "Save note" }).click();
      await page.waitForURL("**/dashboard**", { timeout: 15000 });
    }

    await ctx.close();
  });

  test("select mode then bulk delete", async ({ page }) => {
    await page.goto("/dashboard");

    // Enter select mode
    await page.getByRole("button", { name: "Select" }).click();

    // Select all visible notes
    await page.getByRole("button", { name: "Select all" }).click();

    // Click the bulk Delete button
    const deleteBtn = page.getByRole("button", { name: /Delete \(/ });
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Confirm in dialog
    await expect(page.getByText(/permanently delete/)).toBeVisible();
    await page.getByTestId("confirm-delete-btn").click();
    await page.waitForTimeout(2000);

    // Notes are gone
    for (const title of bulkTitles) {
      await expect(page.getByText(title)).not.toBeVisible();
    }
  });
});

// ── Sign out ──────────────────────────────────────────────────────────────────

test("sign out clears session and redirects to login", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: /sign out/i }).click();
  await page.waitForURL(/authenticate/, { timeout: 10000 });
  await expect(page).not.toHaveURL(/dashboard/);
});
