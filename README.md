# Playwright + TypeScript test framework

Config-driven framework that tests Sauce Demo (UI), Restful-Booker (API) and TodoMVC (second UI app).

## Setup (under 5 minutes)

```bash
npm install
npx playwright install chromium
cp .env.example .env      # URLs and credentials; .env is git-ignored
npm test
npm run report            # open the HTML report
```

Requires Node 18+.

## Running tests

| Goal                  | Command                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Everything            | `npm test`                                                                                                        |
| By tag                | `npm run test:smoke` / `npm run test:regression` (or `--grep @tag`)                                               |
| By project            | `npm run test:ui` / `npm run test:api` / `npm run test:triage`                                                    |
| By app                | `APP=saucedemo npm test`, `APP=todomvc npm test`, `APP=restfulbooker npm test`                                    |
| By role               | Roles are set per file with `test.use({ role: 'problem_user' })`. Run one with `npx playwright test problem-user` |
| Reliability check     | `npm run test:reliability`                                                                                        |
| Lint / format / types | `npm run lint`, `npm run format:check`, `npm run typecheck`                                                       |

## Structure

```
src/config     env loading + typed per-app config (apps.ts)
src/pages      page objects (saucedemo, todomvc)
src/fixtures   typed fixtures: role login (storageState), API client, test-data
src/api        BookingClient + Zod schemas
src/data       test-data builders
tests/ui|api   specs per app, tests/triage corrected flaky spec
docs           TRIAGE, RELIABILITY, AI_USAGE
```

## Design decisions

- **One Playwright project per app** (`ui-saucedemo`, `ui-todomvc`, `api-restfulbooker`), built from `src/config/apps.ts`. `APP=` filters them.
- **Role fixture:** log in once per role per worker, saved as `storageState`; every test still gets its own fresh context.
- **Tags:** every test is `@regression`; a subset is also `@smoke`. PRs run smoke, nightly runs everything.
- **Secrets:** nothing secret is committed; credentials are read lazily from env, so a missing value fails only where it is needed.
- **API tests:** the `booking` fixture creates unique data and deletes it in teardown, even on failure. Responses are validated with Zod.
- **Known defects:** `problem_user` bugs are asserted correctly and marked `test.fail()`.
- **Defaults:** 30s test timeout, 5s expect, 2 retries in CI only, trace and screenshot kept on failure.

## Onboarding a third app

1. Add its URL (and any credentials) to `.env.example` and `src/config/env.ts`.
2. Add an entry to `APPS` in `src/config/apps.ts` (name, kind `ui`/`api`, baseURL, roles, tags, optional `testIdAttribute`).
3. Create `tests/<kind>/<name>/` for its specs.
4. Add page objects under `src/pages/<name>/` (or an API client under `src/api/`) and a fixture file if it needs login or data.
5. Run it with `APP=<name> npm test`. CI picks it up automatically.

## CI

`.github/workflows/ci.yml`: pull requests run lint, typecheck, format check and `@smoke`; the nightly schedule (and manual dispatch) runs the full suite. The HTML report, traces and screenshots are uploaded as artifacts, and npm and browser downloads are cached. Set `SAUCE_PASSWORD`, `BOOKER_USERNAME` and `BOOKER_PASSWORD` as repository variables.

Successful run: [View successful GitHub Actions run](https://github.com/kothariaSamirhussainZakirhussain/Script-Assist-QA-Assignment_Framework/actions/runs/45645496774)
