import { expect, type Locator, type Page } from '@playwright/test';
import { env } from '../../config/env';
import type { SauceRole } from '../../config/apps';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.submit = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }

  /** Full successful login for a role. `timeout` lets slow roles wait longer without global changes. */
  async loginAs(role: SauceRole, timeout?: number): Promise<void> {
    await this.goto();
    await this.login(role, env.saucePassword);
    await expect(this.page).toHaveURL(/inventory\.html/, { timeout });
  }
}
