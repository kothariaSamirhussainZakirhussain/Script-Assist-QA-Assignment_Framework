# Reliability

Command: `npm run test:reliability` (`npx playwright test --repeat-each=5 --workers=4`).

## Run result

> **TODO before submitting:** this suite was written without network access, so the repeat run has
> not been executed yet. Run the command above, then replace this block with the real result:
> what failed or was flaky, the root cause, and what changed. Do not submit it unfilled.

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
