import path from 'node:path';
import { test as base, expect } from '@playwright/test';
import { APPS, type SauceRole } from '../config/apps';
import { LoginPage } from '../pages/saucedemo/LoginPage';
import { InventoryPage } from '../pages/saucedemo/InventoryPage';
import { CartPage } from '../pages/saucedemo/CartPage';
import { CheckoutPage } from '../pages/saucedemo/CheckoutPage';

interface Pages {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
}

interface Options {
  /** Set with test.use({ role }) to start the test already logged in. null = logged out. */
  role: SauceRole | null;
}

interface WorkerFixtures {
  /** Logs in once per role per worker and returns the saved storageState file path. */
  authState: (role: SauceRole) => Promise<string>;
}

export const test = base.extend<Pages & Options, WorkerFixtures>({
  role: [null, { option: true }],

  authState: [
    async ({ browser }, use, workerInfo) => {
      const cache = new Map<SauceRole, string>();
      await use(async (role) => {
        const cached = cache.get(role);
        if (cached) return cached;
        const context = await browser.newContext({ baseURL: APPS.saucedemo.baseURL });
        const page = await context.newPage();
        await new LoginPage(page).loginAs(role, 20_000);
        const file = path.join('.auth', `${role}-worker${workerInfo.workerIndex}.json`);
        await context.storageState({ path: file });
        await context.close();
        cache.set(role, file);
        return file;
      });
    },
    { scope: 'worker' },
  ],

  // Each test gets its own fresh context (isolation) seeded from the cached login state.
  context: async ({ browser, baseURL, role, authState }, use) => {
    const context = await browser.newContext({
      baseURL,
      storageState: role ? await authState(role) : undefined,
    });
    await use(context);
    await context.close();
  },

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
});

export { expect };
