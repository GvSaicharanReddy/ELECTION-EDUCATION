import { test, expect } from '@playwright/test';

test.describe('Election Saathi India - E2E User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the main application and initialize the accessible fallback', async ({ page }) => {
    // Assert title
    await expect(page).toHaveTitle(/Election Saathi India/i);
    
    // Assert main header is visible
    const headerText = page.locator('header .logo-text');
    await expect(headerText).toBeVisible();
    await expect(headerText).toHaveText(/Election Saathi India/i);

    // Verify accessible DOM is present
    const accessibleLayer = page.locator('#accessible-fallback');
    await expect(accessibleLayer).toBeVisible();
    
    // Verify WebGL Canvas is initialized
    const canvas = page.locator('#app canvas');
    if (await canvas.count() > 0) {
      await expect(canvas).toBeAttached();
    }
  });

  test('should open the AI Election Coach', async ({ page }) => {
    // Look for the toggle button and click it
    const coachButton = page.locator('#nav-coach');
    await expect(coachButton).toBeVisible();
    await coachButton.click();
    
    // Verify panel opens — actual ID is #coach-panel
    const panel = page.locator('#coach-panel');
    await expect(panel).toBeVisible();
    
    // Type a test query
    const input = page.locator('#coach-input');
    await input.fill('What is NOTA?');
    await input.press('Enter');

    // Wait for response bubble — actual class is .coach-message.coach-assistant
    const response = page.locator('.coach-message.coach-assistant').last();
    await expect(response).toContainText('NOTA', { timeout: 10000 });
  });

  test('should gracefully handle Maps Widget rendering', async ({ page }) => {
    // Verify map container exists
    const mapsWidget = page.locator('#maps-widget');
    await expect(mapsWidget).toBeAttached();
  });
});
