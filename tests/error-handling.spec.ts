import { test, expect } from '@playwright/test';

test('App handles AI API failure gracefully', async ({ page }) => {
  // Mock Mapbox Directions API to ensure we have route data
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

  // Mock Mapbox Geocoding API (optional but good for stability)
  await page.route('https://api.mapbox.com/geocoding/v5/mapbox.places/**', async route => {
    const json = {
      features: [{ center: [3.3, 6.5] }]
    };
    await route.fulfill({ json });
  });

  // Mock the AI API to fail
  await page.route('/api/ai/route-insight', async route => {
    await route.abort('failed');
  });

  // Navigate to results page
  await page.goto('/results?origin=Lagos&destination=Ikeja');

  // Wait for the fallback route to appear
  // The fallback route has ID 'fallback-driving' and mode 'Driving'
  await expect(page.getByText('Driving')).toBeVisible({ timeout: 10000 });
  
  // Ensure the loading spinner is gone
  await expect(page.getByText('Analyzing traffic & safety...')).not.toBeVisible();
  
  // Ensure we can still start the journey on the fallback route
  await expect(page.getByRole('button', { name: 'Start Journey' })).toBeVisible();
});
