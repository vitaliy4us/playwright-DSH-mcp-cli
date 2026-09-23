import { test, expect } from '@playwright/test';

// Test Case 1: Create a new article
// Automated with Playwright MCP: https://conduit.bondaracademy.com/
test('Create a new article', async ({ page }) => {
  // 1. Navigate to https://conduit.bondaracademy.com/
  await page.goto('https://conduit.bondaracademy.com/');

  // 2. In the top of the corner click "Sign In" button. Login page should be opened
  await page.getByRole('link', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

  // 3. Enter email: "pwtest@test.com", enter password "Welcome2" and click Sign in button.
  //    User should be redirected to the home page. User should be logged in and the username
  //    should be displayed in the top right corner.
  // Credentials are read from the environment so the shared demo account is not baked into the test.
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.CONDUIT_EMAIL ?? 'pwtest@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.CONDUIT_PASSWORD ?? 'Welcome2');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/^https:\/\/conduit\.bondaracademy\.com\/$/);
  await expect(page.locator('.navbar')).toContainText('pwtest');

  // 4. Click "New Article" link menu item. The editor page should be displayed
  await page.getByRole('link', { name: /New Article/ }).click();
  await expect(page).toHaveURL(/\/editor/);

  // 5. Type fill out the form with a random article title, article description and article body.
  //    Click Publish Article button.
  const randomSuffix = Date.now();
  const articleTitle = `PW Test Article ${randomSuffix}`;
  const articleDescription = `This is a Playwright automated test article ${randomSuffix}`;
  const articleBody = `This is the body of the article created by the automated Playwright test. Random value: ${randomSuffix}`;

  await page.getByRole('textbox', { name: 'Article Title' }).fill(articleTitle);
  await page.getByRole('textbox', { name: "What's this article about?" }).fill(articleDescription);
  await page.getByRole('textbox', { name: /Write your article/ }).fill(articleBody);
  await page.getByRole('button', { name: 'Publish Article' }).click();

  // The article details page should be opened with details of the created article.
  await expect(page).toHaveURL(/\/article\//);
  await expect(page.getByRole('heading', { name: articleTitle })).toBeVisible();
  await expect(page.getByText(articleBody)).toBeVisible();

  // The "Edit Article" and "Delete Article" buttons should be visible to the right of the username
  await expect(page.getByRole('link', { name: /Edit Article/ }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Delete Article/ }).first()).toBeVisible();

  // The comments block should be visible below the article
  await expect(page.getByRole('textbox', { name: 'Write a comment...' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Post Comment' })).toBeVisible();

  // 6. Click on "Home" link menu item. User should be redirected to the home page and the
  //    "Global Feed" tab should be active. Validate that the first article in the list is the
  //    article created on the step 5.
  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page).toHaveURL(/^https:\/\/conduit\.bondaracademy\.com\/$/);
  // The "Global Feed" tab should be active
  await expect(
    page.locator('.feed-toggle .nav-link.active').filter({ hasText: 'Global Feed' })
  ).toBeVisible();
  await expect(
    page.locator('.feed-toggle .nav-link.active').filter({ hasText: 'Your Feed' })
  ).toHaveCount(0);

  // The Global Feed is ordered by recency and this suite shares one account, so a test running in
  // parallel can push its own article to the top. Assert on our article by title instead of relying
  // on its position in the list (the manual test case assumed a single user working alone).
  const feedArticle = page.locator('.article-preview').filter({ hasText: articleTitle });
  await expect(feedArticle).toBeVisible();

  // 7. Click on this newly created article. Verify that the article details page is opened.
  await feedArticle.getByRole('heading', { name: articleTitle }).click();
  await expect(page).toHaveURL(/\/article\//);
  await expect(page.getByRole('heading', { name: articleTitle })).toBeVisible();
  await expect(page.getByRole('button', { name: /Delete Article/ }).first()).toBeVisible();

  // 8. Delete the article
  await page.getByRole('button', { name: /Delete Article/ }).first().click();
  await expect(page).toHaveURL(/^https:\/\/conduit\.bondaracademy\.com\/$/);
  await expect(page.getByRole('heading', { name: articleTitle })).toHaveCount(0);
});
