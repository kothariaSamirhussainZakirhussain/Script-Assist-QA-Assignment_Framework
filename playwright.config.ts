import { defineConfig, devices } from '@playwright/test';
import { APPS, selectedApps, testDirFor } from './src/config/apps';

const isCI = !!process.env.CI;
const apps = selectedApps();
const includeTriage = !process.env.APP || process.env.APP === 'saucedemo';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    // One project per app: names are ui-<app> / api-<app>, so --project="ui-*" or "api-*" works.
    ...apps.map((app) => ({
      name: `${app.kind}-${app.name}`,
      testDir: testDirFor(app),
      use:
        app.kind === 'ui'
          ? {
              ...devices['Desktop Chrome'],
              baseURL: app.baseURL,
              ...(app.testIdAttribute ? { testIdAttribute: app.testIdAttribute } : {}),
            }
          : { baseURL: app.baseURL, extraHTTPHeaders: { Accept: 'application/json' } },
    })),
    ...(includeTriage
      ? [
          {
            name: 'triage',
            testDir: './tests/triage',
            use: {
              ...devices['Desktop Chrome'],
              baseURL: APPS.saucedemo.baseURL,
              testIdAttribute: 'data-test',
            },
          },
        ]
      : []),
  ],
});
