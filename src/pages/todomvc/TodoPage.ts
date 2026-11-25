import type { Locator, Page } from '@playwright/test';

export class TodoPage {
  readonly newTodo: Locator;
  readonly items: Locator;
  readonly count: Locator;
  readonly clearCompleted: Locator;

  constructor(private readonly page: Page) {
    this.newTodo = page.getByPlaceholder('What needs to be done?');
    this.items = page.getByTestId('todo-item');
    this.count = page.getByTestId('todo-count');
    this.clearCompleted = page.getByRole('button', { name: 'Clear completed' });
  }

  async goto(): Promise<void> {
    await this.page.goto('./');
  }

  async add(...titles: string[]): Promise<void> {
    for (const title of titles) {
      await this.newTodo.fill(title);
      await this.newTodo.press('Enter');
    }
  }

  item(title: string): Locator {
    return this.items.filter({ hasText: title });
  }

  async toggle(title: string): Promise<void> {
    await this.item(title).getByRole('checkbox', { name: 'Toggle Todo' }).check();
  }

  async remove(title: string): Promise<void> {
    const item = this.item(title);
    await item.hover();
    // The delete button has no accessible name in this demo app, so the class is the stable hook.
    await item.locator('.destroy').click();
  }

  async filter(name: 'All' | 'Active' | 'Completed'): Promise<void> {
    await this.page.getByRole('link', { name }).click();
  }
}
