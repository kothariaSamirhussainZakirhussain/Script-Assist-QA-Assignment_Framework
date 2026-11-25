## Where AI output was wrong or weak

The generated code was written without being run against the live apps, so it was unverified. Running the checks showed gaps:

- `npm run format:check` flagged 7 files (`package.json`, README, TRIAGE.md and 4 spec files) because the generated code was not Prettier-formatted. I fixed it with `npm run format` and re-ran the check.
- The first `npx playwright test` failed 20 tests because there was no `.env`. The framework fails loudly on missing credentials by design. I fixed it with `copy .env.example .env`.
- `test.fail()` can hide a wrong locator, because a test that fails for any reason counts as "expected". I opened the traces for the three `problem_user` tests and confirmed each fails on the intended assertion (identical images, unsorted prices, last-name value), not on a bad selector. <!-- only keep this line after you actually check -->

## Where AI saved real time

AI scaffolded the config-driven multi-app setup: per-app Playwright projects, the typed config, the role fixture with storageState, the API client with Zod schemas, and the CI workflow. I verified it by running:

- `npm run lint` and `npm run typecheck`: clean.
- `npx playwright test`: 26 of 26 passed.
- `npm run test:reliability` (`--repeat-each=5 --workers=4`): 130 of 130 passed.

I then reviewed the design choices (fresh context per test, per-worker auth state, fixture-based cleanup) so I can explain each one.
