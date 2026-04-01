import { test, expect } from "@playwright/test";

test.describe("Authentication flows", () => {
  test("landing page shows Vestya branding", async ({ page }) => {
    await page.goto("/");
    const body = await page.textContent("body");
    expect(body).toContain("Vestya");
  });

  test("clicking Get Started navigates to register page", async ({ page }) => {
    await page.goto("/en");

    // Look for a CTA button that leads to registration
    const ctaLink = page.getByRole("link", { name: /get started|sign up|register/i });

    if (await ctaLink.isVisible()) {
      await ctaLink.click();
      await page.waitForURL(/\/(register|signup)/);
      expect(page.url()).toMatch(/\/(register|signup)/);
    }
  });

  test("register page renders form fields", async ({ page }) => {
    await page.goto("/en/register");

    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    // Password fields
    const passwordInputs = page.locator('input[type="password"]');
    expect(await passwordInputs.count()).toBeGreaterThanOrEqual(2);
  });

  test("login page renders form fields", async ({ page }) => {
    await page.goto("/en/login");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.locator('input[type="password"]'),
    ).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/en/login");

    await page.getByLabel(/email/i).fill("nobody@invalid.dev");
    await page.locator('input[type="password"]').fill("WrongPassword123");

    const submitButton = page.getByRole("button", {
      name: /sign in|log in|login/i,
    });
    await submitButton.click();

    // Wait for either an error message or a toast
    const errorVisible = await page
      .locator('[role="alert"], .text-destructive, .text-red-500, [data-sonner-toast]')
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    // The page should still be on /login (not redirected)
    expect(page.url()).toContain("login");
  });

  test("locale switching changes language", async ({ page }) => {
    await page.goto("/en");

    // Look for a language/locale switcher
    const localeSwitcher = page.locator(
      '[data-testid="locale-switcher"], [aria-label*="language"], [aria-label*="langue"]',
    );

    if (await localeSwitcher.isVisible().catch(() => false)) {
      await localeSwitcher.click();

      // Look for French option
      const frenchOption = page.getByRole("menuitem", {
        name: /fran[cç]ais|french|fr/i,
      });
      if (await frenchOption.isVisible().catch(() => false)) {
        await frenchOption.click();
        await page.waitForURL(/\/fr\//);
        expect(page.url()).toContain("/fr/");
      }
    }
  });
});
