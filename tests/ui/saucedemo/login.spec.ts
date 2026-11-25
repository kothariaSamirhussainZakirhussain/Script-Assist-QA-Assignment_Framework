import { test, expect } from '../../../src/fixtures/saucedemo';
import { env } from '../../../src/config/env';

test.describe('Login and access control', { tag: '@regression' }, () => {
  test('standard user logs in and sees the product list', { tag: '@smoke' }, async ({
    loginPage,
    inventoryPage,
    page,
  }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', env.saucePassword);
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('invalid credentials show an error and stay on the login page', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'wrong_password');
    await expect(loginPage.error).toContainText('do not match any user');
  });

  test('locked-out user is blocked with a clear message', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login('locked_out_user', env.saucePassword);
    await expect(loginPage.error).toContainText('locked out');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('protected URL redirects to login when logged out', async ({ loginPage, page }) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.error).toContainText('logged in');
  });
});
