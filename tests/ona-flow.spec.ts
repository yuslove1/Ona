import { test, expect } from '@playwright/test';

test('ONA v1 User Flow', async ({ page }) => {
  // Mock Mapbox Directions API
  await page.route('https://api.mapbox.com/directions/v5/mapbox/driving/**', async route => {
    const json = {
      routes: [{
        distance: 5000,
        duration: 600,
        geometry: { type: 'LineString', coordinates: [[3.3, 6.5], [3.4, 6.6]] },
        legs: [{ steps: [] }]
      }]
    };
    await route.fulfill({ json });
  });

  // Mock Mapbox Geocoding API
  await page.route('https://api.mapbox.com/geocoding/v5/mapbox.places/**', async route => {
    const json = {
      features: [{ center: [3.3, 6.5] }]
    };
    await route.fulfill({ json });
  });

  // Mock AI API to return consistent data for the test
  await page.route('/api/ai/route-insight', async route => {
    const json = {
      recommended_mode: "Public transport",
      summary: "Test Summary",
      reason: "Test Reason",
      routes: [
        { mode: "Bus + Walking", time: "45 mins", cost: "₦500", stress: "medium" },
        { mode: "Ride-hailing", time: "25 mins", cost: "₦2,800", stress: "low" },
        { mode: "Motorcycle", time: "15 mins", cost: "₦1,200", stress: "high" }
      ],
      tips: ["Test Tip"]
    };
    await route.fulfill({ json });
  });

  // 1. Navigate to Home
  await page.goto('/');
  await expect(page).toHaveTitle(/ONA/i); // Next.js default title might be different, but let's check content
  await expect(page.getByText('Find the smartest way through Lagos.')).toBeVisible();

  // 2. Fill Form
  const fromInput = page.getByPlaceholder('Your current location or starting...');
  const toInput = page.getByPlaceholder('Enter your destination');
  
  await fromInput.fill('Ikeja');
  await toInput.fill('Victoria Island');

  // 3. Submit
  await page.getByRole('button', { name: 'Get Route' }).click();

  // 4. Verify Navigation
  await expect(page).toHaveURL(/\/results/);
  await expect(page.getByRole('heading', { name: 'Route Results' })).toBeVisible();

  // 5. Verify Route Cards
  await expect(page.getByText('Bus + Walking')).toBeVisible();
  await expect(page.getByText('Ride-hailing')).toBeVisible();
  await expect(page.getByText('Motorcycle')).toBeVisible();

  // 6. Verify Lagos Tips
  await expect(page.getByText('Lagos Tips for Your Journey')).toBeVisible();

  // 7. Navigate to AI Insights
  await page.getByRole('button', { name: 'Details' }).first().click();
  await expect(page).toHaveURL(/\/ai-insights/);
  await expect(page.getByRole('heading', { name: 'AI Insights' })).toBeVisible();

  // 8. Verify AI Content
  await expect(page.getByText('Route Summary')).toBeVisible();
  await expect(page.getByText('Why this Route?')).toBeVisible();
});
