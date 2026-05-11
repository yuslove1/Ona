import { test, expect } from '@playwright/test';

test.describe('Ona App Flow', () => {
  test('should navigate from home to results and start a journey', async ({ page }) => {
    test.slow();
    // 1. Visit Home Page
    await page.goto('/');
    
    // Check for main headline
    await expect(page.locator('h1')).toContainText('Move Smarter Through Lagos');

    // 2. Fill the Route Form
    const originInput = page.getByPlaceholder('Starting point...');
    const destinationInput = page.getByPlaceholder('Where to?');
    
    await originInput.fill('Ikeja');
    await destinationInput.fill('Victoria Island');
    
    // Submit the form
    await page.getByRole('button', { name: 'Get Smartest Route' }).click();

    // 3. Verify Results Page
    await expect(page).toHaveURL(/\/results/, { timeout: 15000 });
    await expect(page.getByText('Available Options')).toBeVisible({ timeout: 15000 });
    
    // Wait for AI insights to load (the loader should disappear)
    const startBtn = page.getByRole('button', { name: /START JOURNEY/i }).first();
    await startBtn.waitFor({ state: 'visible', timeout: 30000 });

    // 4. Start a Journey
    await startBtn.click();

    // 5. Verify Navigation Overlay
    await expect(page.getByText('NAVIGATING TO')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Victoria Island' })).toBeVisible();
    
    // Check if instructions are present
    await expect(page.locator('h3.text-4xl')).not.toBeEmpty();

    // Navigate through steps until FINISH is available
    const nextBtn = page.getByRole('button', { name: 'NEXT STEP' });
    while (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(500); // Wait for animation
    }

    // 6. End Journey
    await page.getByRole('button', { name: /FINISH/i }).click();
    
    // Should be back on results page (overlay closed)
    await expect(page.getByText('NAVIGATING TO')).not.toBeVisible();
  });

  test('should swap origin and destination', async ({ page }) => {
    await page.goto('/');
    
    const originInput = page.getByPlaceholder('Starting point...');
    const destinationInput = page.getByPlaceholder('Where to?');
    
    await originInput.fill('Point A');
    await destinationInput.fill('Point B');
    
    // Click swap button
    await page.getByLabel('Swap locations').click();
    
    expect(await originInput.inputValue()).toBe('Point B');
    expect(await destinationInput.inputValue()).toBe('Point A');
  });
});
