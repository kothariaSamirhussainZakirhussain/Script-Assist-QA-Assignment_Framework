# Reliability

Command: `npm run test:reliability` (`npx playwright test --repeat-each=5 --workers=4`).

## Run result

`npx playwright test --repeat-each=5 --workers=4` → **130 passed, 0 failed, 0 flaky** (26 tests × 5, 2.6 min).
The 15 `problem_user` runs show ✘ in the list reporter because they are marked `test.fail()`; Playwright counts them as passed.

**What failed or was flaky:** nothing in the repeat run. One earlier failure was environmental: the first
run had no `.env`, so 20 tests failed with "Missing environment variable". The framework failed loudly
as designed, and copying `.env.example` to `.env` fixed it.

**Root cause / changes:** none needed after that. Stability comes from the risks listed below
(per-test fresh contexts, per-worker auth state, unique API data with fixture cleanup, no hard waits,
per-assertion timeouts for the slow user).

## Risks the suite is designed against

- **Shared state:** each test uses a fresh browser context; the role fixture only caches the
  login `storageState` file, never the cart. The API `booking` fixture creates unique data per test.
- **Hard waits:** none. Web-first assertions and `expect.poll` are used for sorting.
- **Slow user:** `performance_glitch_user` gets longer timeouts on its own assertions only.
  Global timeouts stay at 30s test / 5s expect.
- **Worker parallelism:** storage state files are per role per worker (`.auth/<role>-worker<N>.json`),
  so parallel workers never write the same file.
- **Restful-Booker resets and sleeps:** no test relies on existing data; the token is fetched per
  worker, and bad-credential responses (HTTP 200 with `reason`) are caught by schema validation.
- **Cleanup on failure:** the `booking` fixture deletes in teardown, which runs even when the test fails.
- **Known-defect tests:** `test.fail()` keeps `problem_user` bugs visible without turning the suite red.
