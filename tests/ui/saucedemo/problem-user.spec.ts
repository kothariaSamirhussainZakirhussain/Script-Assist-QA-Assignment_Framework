import { test, expect } from '../../../src/fixtures/saucedemo';

/**
 * Documents known defects for problem_user. Each test asserts the CORRECT behaviour and is marked
 * test.fail(), so the suite stays green while the bug is visible. If a defect is fixed, the test
 * "unexpectedly passes" and fails the run, which is the signal to remove the marker.
 */
test.describe('problem_user defects', { tag: '@regression' }, () => {
  test.use({ role: 'problem_user' });

  test('DEFECT-1: every product shows its own image', async ({ inventoryPage }) => {
    test.fail(true, 'DEFECT-1: all products render the same placeholder image');
    await inventoryPage.goto();
    await expect(inventoryPage.items).toHaveCount(6);
    const sources = await inventoryPage.imageSources();
    expect(new Set(sources).size).toBe(sources.length);
  });

  test('DEFECT-2: sorting by price low to high orders the list', async ({ inventoryPage }) => {
    test.fail(true, 'DEFECT-2: the sort dropdown does not reorder products');
    await inventoryPage.goto();
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('DEFECT-3: last name keeps the value that was typed', async ({ checkoutPage }) => {
    test.fail(true, 'DEFECT-3: the last name field does not retain the typed value');
    await checkoutPage.gotoStepOne();
    await checkoutPage.fillInfo({ firstName: 'Sam', lastName: 'Tester', postalCode: '380001' });
    await expect(checkoutPage.lastName).toHaveValue('Tester');
  });
});
