import { test, expect } from '../../src/fixtures/saucedemo';

// Corrected version of the junior engineer's spec. See docs/TRIAGE.md for the review.
test.describe('Cart (triage fix)', { tag: '@regression' }, () => {
  test.use({ role: 'standard_user' }); // log in once per worker, not in every test

  test('add item and verify cart badge', async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart('sauce-labs-backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('checkout shows correct price', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    // Own setup: no dependence on the previous test.
    await inventoryPage.goto();
    await inventoryPage.addToCart('sauce-labs-backpack');
    await cartPage.goto();

    await expect(cartPage.itemPrices).toHaveText(['$29.99']);
    await cartPage.checkoutButton.click(); // no force: a blocked click is a real bug

    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(checkoutPage.firstName).toBeVisible();
  });
});
