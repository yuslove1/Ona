import { test, expect } from '@playwright/test';

test('Navigation Overlay displays localized instructions', async ({ page }) => {
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

  // Mock the AI API response
  await page.route('/api/ai/route-insight', async route => {
    const json = {
      recommended_mode: "Public transport",
      summary: "Test Summary",
      reason: "Test Reason",
      routes: [
        {
          mode: "Bus + Walking",
          time: "45 mins",
          cost: "₦500",
          stress: "medium",
          steps: [
            {
              maneuver: { instruction: "Walk to the nearest junction", type: "walk" },
              distance: 200,
              duration: 300,
              name: "Walk"
            },
            {
              maneuver: { instruction: "Look for a yellow Danfo bus going to Berger", type: "bus" },
              distance: 0,
              duration: 0,
              name: "Wait"
            }
          ]
        }
      ],
      tips: ["Test Tip"]
    };
    await route.fulfill({ json });
  });

  // Navigate to results page
  await page.goto('/results?origin=Lagos&destination=Ikeja');

  // Wait for the route card to appear
  await expect(page.getByText('Bus + Walking')).toBeVisible();

  // Click Start Journey
  await page.getByRole('button', { name: 'Start Journey' }).first().click();

  // Verify Navigation Overlay appears
  await expect(page.getByText('Navigating to')).toBeVisible();

  // Verify the first instruction is displayed
  await expect(page.getByText('Walk to the nearest junction')).toBeVisible();

  // Click Next Step
  await page.getByRole('button', { name: 'Next Step' }).click();

  // Verify the second instruction
  await expect(page.getByText('Look for a yellow Danfo bus going to Berger')).toBeVisible();
});
