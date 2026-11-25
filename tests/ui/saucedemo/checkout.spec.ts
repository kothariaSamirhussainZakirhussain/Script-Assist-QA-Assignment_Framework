import { test, expect } from '../../../src/fixtures/saucedemo';

test.describe('Cart and checkout', { tag: '@regression' }, () => {
  test.use({ role: 'standard_user' });

  test('completes an end-to-end purchase', { tag: '@smoke' }, async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.cartLink.click();

    await expect(cartPage.itemNames).toHaveText(['Sauce Labs Backpack']);
    await expect(cartPage.itemPrices).toHaveText(['$29.99']);
    await cartPage.checkoutButton.click();

    await checkoutPage.fillInfo({ firstName: 'Sam', lastName: 'Tester', postalCode: '380001' });
    await checkoutPage.continueButton.click();
    await expect(checkoutPage.itemTotal).toHaveText('Item total: $29.99');

    await checkoutPage.finishButton.click();
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });

  test('shows a validation error when required checkout info is missing', async ({
    checkoutPage,
    page,
  }) => {
    await checkoutPage.gotoStepOne();
    await checkoutPage.fillInfo({ lastName: 'Tester', postalCode: '380001' });
    await checkoutPage.continueButton.click();

    await expect(checkoutPage.error).toContainText('First Name is required');
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });
});
