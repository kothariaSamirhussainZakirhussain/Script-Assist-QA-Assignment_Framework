import { test, expect } from '../../../src/fixtures/saucedemo';

test.describe('Inventory', { tag: '@regression' }, () => {
  test.use({ role: 'standard_user' });

  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('sorts products by price and by name', async ({ inventoryPage }) => {
    const initialPrices = await inventoryPage.prices();
    const initialNames = await inventoryPage.names();

    await inventoryPage.sortBy('lohi');
    await expect
      .poll(() => inventoryPage.prices())
      .toEqual([...initialPrices].sort((a, b) => a - b));

    await inventoryPage.sortBy('za');
    await expect.poll(() => inventoryPage.names()).toEqual([...initialNames].sort().reverse());
  });

  test('adds and removes items and keeps the cart badge in sync', { tag: '@smoke' }, async ({
    inventoryPage,
  }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.removeFromCart('sauce-labs-backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.removeFromCart('sauce-labs-bike-light');
    await expect(inventoryPage.cartBadge).toBeHidden();
  });
});
