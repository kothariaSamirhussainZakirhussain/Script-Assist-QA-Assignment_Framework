# Flaky test triage and code review

Corrected spec: `tests/triage/cart-price.fixed.spec.ts`.

## 1. Problems, ranked by impact

| #   | Problem                                                                                                     | Why it breaks or misleads                                                                                                                                                                                                                                                                     |
| --- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Test 2 depends on test 1 (`mode: 'serial'`, shared `cartCount`, and an assumed logged-in cart)              | Every test gets a fresh context. Test 2 opens `/cart.html` logged out, so it is redirected to login and the price locator never appears. It "passes" locally only when state leaks. One failure also skips everything after it in serial mode. This is the main source of random CI failures. |
| 2   | Final assertion `expect(cartCount).toBe(1)` in test 2 checks a leftover variable                            | It never asserts anything about checkout. The test can go green while checkout is broken, which is a false pass.                                                                                                                                                                              |
| 3   | `locator.count()` right after the click, then `toBe(1)`                                                     | `count()` does not wait or retry. If the badge has not rendered yet it returns 0 and fails; on a fast machine it passes. It also only proves the badge exists, not that it says "1".                                                                                                          |
| 4   | `waitForTimeout(3000)`                                                                                      | A fixed sleep is too slow when the app is fast and too short when CI is slow. It hides the real condition being waited for.                                                                                                                                                                   |
| 5   | `click('#checkout', { force: true })`                                                                       | Skips actionability checks, so an overlay or disabled button no longer fails the test. It hides real UI bugs.                                                                                                                                                                                 |
| 6   | `textContent()` + `toBe` for the price                                                                      | Reads once, with no retry, and fails on strict-mode violations if more than one price is present. Use `toHaveText`, which retries.                                                                                                                                                            |
| 7   | Positional XPath `//div[@class="inventory_list"]/div[1]//button`                                            | Breaks when the item order or markup changes, and does not say which product was added, so `$29.99` is unexplained.                                                                                                                                                                           |
| 8   | Login repeated by hand with `#id` selectors, hard-coded URLs and credentials, legacy `page.fill/page.click` | Duplication, no `baseURL`, credentials in code, and selectors tied to ids instead of test ids/roles.                                                                                                                                                                                          |

## 2. PR review comments

**blocker:** Thanks for adding coverage here. The two tests are coupled. Playwright gives every test a new browser context, so in `checkout shows correct price` you are not logged in and the cart is empty. It can only pass when state leaks from the first test. Could each test set up its own state? Logging in through the shared role fixture (`test.use({ role: 'standard_user' })`) makes that cheap, and then `serial` mode and the shared `cartCount` can go.

**blocker:** The last line, `expect(cartCount).toBe(1)`, checks the variable from the first test, not the checkout page, so this test would pass even if checkout were broken. Try asserting what the test is named after, for example the cart price and then that we land on `checkout-step-one`.

**blocker:** `{ force: true }` on the checkout click turns off the checks that tell us the button is usable. If the click needs force, that is usually a bug worth reporting. Please remove it.

**suggestion:** `locator.count()` does not wait, so it can read 0 before the badge renders. A web-first assertion retries until it is true and checks the content: `await expect(badge).toHaveText('1')`.

**suggestion:** Instead of `waitForTimeout(3000)`, wait for the condition you actually need. Here, the add-to-cart button or inventory list being visible is enough, and Playwright already waits for that before clicking.

**suggestion:** Prefer `getByTestId`/`getByRole` through page objects over the positional XPath. Adding the product by name also makes `$29.99` self-explanatory.

**suggestion:** `expect(page.getByTestId('inventory-item-price')).toHaveText('$29.99')` retries, while `textContent()` reads once.

**nit:** URL and credentials can come from config (`baseURL`, `.env`), so the spec can run against other environments.

**nit:** `page.fill` and `page.click` still work, but locators (`locator.fill`) are the recommended style.

Nice instinct to cover the price, by the way. The fix is mostly about making each test independent and letting assertions do the waiting.
