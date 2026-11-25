import { test, expect } from '@playwright/test';
import { TodoPage } from '../../../src/pages/todomvc/TodoPage';

test.describe('TodoMVC', { tag: '@regression' }, () => {
  let todos: TodoPage;

  test.beforeEach(async ({ page }) => {
    todos = new TodoPage(page);
    await todos.goto();
  });

  test('adds todos and shows the remaining count', { tag: '@smoke' }, async () => {
    await todos.add('Write tests', 'Review PR');
    await expect(todos.items).toHaveText(['Write tests', 'Review PR']);
    await expect(todos.count).toHaveText('2 items left');
  });

  test('marks a todo as completed', async () => {
    await todos.add('Write tests', 'Review PR');
    await todos.toggle('Write tests');
    await expect(todos.item('Write tests')).toHaveClass(/completed/);
    await expect(todos.count).toHaveText('1 item left');
  });

  test('filters active todos', async () => {
    await todos.add('Write tests', 'Review PR');
    await todos.toggle('Write tests');
    await todos.filter('Active');
    await expect(todos.items).toHaveText(['Review PR']);
  });

  test('deletes a todo', { tag: '@smoke' }, async () => {
    await todos.add('Write tests');
    await todos.remove('Write tests');
    await expect(todos.items).toHaveCount(0);
  });
});
