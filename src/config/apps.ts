import { env } from './env';

export type AppName = 'saucedemo' | 'todomvc' | 'restfulbooker';

export const SAUCE_ROLES = [
  'standard_user',
  'locked_out_user',
  'problem_user',
  'performance_glitch_user',
] as const;
export type SauceRole = (typeof SAUCE_ROLES)[number];

export interface AppConfig {
  name: AppName;
  kind: 'ui' | 'api';
  baseURL: string;
  roles: readonly string[];
  tags: readonly string[];
  /** Attribute used by getByTestId for this app. */
  testIdAttribute?: string;
}

/** Single place that describes each application. Onboarding a new app starts here. */
export const APPS: Record<AppName, AppConfig> = {
  saucedemo: {
    name: 'saucedemo',
    kind: 'ui',
    baseURL: env.sauceBaseUrl,
    roles: SAUCE_ROLES,
    tags: ['@smoke', '@regression'],
    testIdAttribute: 'data-test',
  },
  todomvc: {
    name: 'todomvc',
    kind: 'ui',
    baseURL: env.todoBaseUrl,
    roles: [],
    tags: ['@smoke', '@regression'],
  },
  restfulbooker: {
    name: 'restfulbooker',
    kind: 'api',
    baseURL: env.bookerBaseUrl,
    roles: ['admin'],
    tags: ['@smoke', '@regression'],
  },
};

/** APP=todomvc narrows the run to one app; unset runs all of them. */
export function selectedApps(requested: string | undefined = process.env.APP): AppConfig[] {
  if (!requested) return Object.values(APPS);
  const app = APPS[requested as AppName];
  if (!app) {
    throw new Error(`Unknown APP "${requested}". Valid values: ${Object.keys(APPS).join(', ')}`);
  }
  return [app];
}

export const testDirFor = (app: AppConfig): string => `./tests/${app.kind}/${app.name}`;
