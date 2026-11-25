import { test, expect } from '../../../src/fixtures/saucedemo';

test.describe('Slow responses', { tag: '@regression' }, () => {
  test('performance_glitch_user can log in and view products', async ({
    loginPage,
    inventoryPage,
  }) => {
    // The delay is handled per assertion, so global timeouts stay unchanged.
    await loginPage.loginAs('performance_glitch_user', 20_000);
    await expect(inventoryPage.items).toHaveCount(6, { timeout: 15_000 });
  });
});
