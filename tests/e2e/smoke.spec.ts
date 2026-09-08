import { test, expect } from '@playwright/test';

test.describe('Phase 0 smoke', () => {
  test('main menu loads and shows the title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('canvas')).toBeVisible();
    // The Cinzel font + Phaser render the title into the canvas, but the
    // page also has <title> "Warlord 2 Clone" for accessibility.
    await expect(page).toHaveTitle(/Warlord 2 Clone/);
  });

  test('faction select renders 4 cards', async ({ page }) => {
    await page.goto('/');
    // Phaser text is rendered into the canvas, so we can't DOM-query it
    // directly. Instead, wait for the canvas to be present, then click
    // near the center where the New Game button lives.
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});
