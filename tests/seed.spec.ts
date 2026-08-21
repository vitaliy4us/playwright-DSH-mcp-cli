import { test, expect } from '@playwright/test';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    // Seed: land on the app under test (login state is fresh, so the scenario
    // "Create a new article" starts logged out).
    await page.goto('https://conduit.bondaracademy.com/');
  });
});
