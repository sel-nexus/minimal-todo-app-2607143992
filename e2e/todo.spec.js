const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

/** Open the fixture directly from disk, as required by the PRD. */
async function openTodoApp(page) {
  const appUrl = pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href;
  await page.goto(appUrl);
}

test.describe('Minimal Todo App', () => {
  test('supports the complete deterministic in-session todo workflow without console errors', async ({ page }) => {
    const browserIssues = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        browserIssues.push(`${message.type()}: ${message.text()}`);
      }
    });
    page.on('pageerror', (error) => browserIssues.push(`pageerror: ${error.message}`));

    await openTodoApp(page);

    await expect(page.getByRole('heading', { name: 'Todo App' })).toBeVisible();
    await expect(page.getByTestId('todo-input')).toHaveAttribute('type', 'text');
    await expect(page.getByTestId('add-button')).toHaveText('Add');
    await expect(page.getByTestId('empty-state')).toHaveText('No tasks yet.');
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('todo-list')).toBeEmpty();

    await page.getByTestId('todo-input').fill('Buy milk');
    await page.getByTestId('add-button').click();
    await expect(page.getByTestId('todo-item-1')).toBeVisible();
    await expect(page.getByTestId('todo-title-1')).toHaveText('Buy milk');
    await expect(page.getByTestId('todo-input')).toHaveValue('');
    await expect(page.getByTestId('empty-state')).toBeHidden();

    await page.getByTestId('todo-input').fill('Walk dog');
    await page.getByTestId('todo-input').press('Enter');
    await expect(page.getByTestId('todo-item-2')).toBeVisible();
    await expect(page.locator('[data-testid^="todo-item-"]')).toHaveCount(2);
    await expect(page.getByTestId('todo-list')).toContainText('Buy milk');
    await expect(page.getByTestId('todo-list')).toContainText('Walk dog');
    await expect(page.locator('[data-testid^="todo-item-"]').evaluateAll((items) => items.map((item) => item.dataset.testid))).resolves.toEqual(['todo-item-1', 'todo-item-2']);

    await page.getByTestId('todo-input').fill('<b>literal</b>');
    await page.getByTestId('add-button').click();
    await expect(page.getByTestId('todo-item-3')).toBeVisible();
    await expect(page.getByTestId('todo-title-3')).toHaveText('<b>literal</b>');
    await expect(page.getByTestId('todo-item-3').locator('b')).toHaveCount(0);

    await page.getByTestId('add-button').click();
    await page.getByTestId('todo-input').fill('   ');
    await page.getByTestId('todo-input').press('Enter');
    await expect(page.locator('[data-testid^="todo-item-"]')).toHaveCount(3);

    await page.getByTestId('todo-checkbox-1').check();
    await expect(page.getByTestId('todo-title-1')).toHaveCSS('text-decoration-line', 'line-through');
    await expect(page.getByTestId('todo-title-2')).toHaveCSS('text-decoration-line', 'none');
    await page.screenshot({ path: 'test-results/todo-workflow.png', fullPage: true });
    await page.getByTestId('todo-checkbox-1').uncheck();
    await expect(page.getByTestId('todo-title-1')).toHaveCSS('text-decoration-line', 'none');

    await page.getByTestId('todo-delete-1').click();
    await expect(page.getByTestId('todo-item-1')).toHaveCount(0);
    await expect(page.getByTestId('todo-item-2')).toBeVisible();
    await page.getByTestId('todo-delete-2').click();
    await expect(page.getByTestId('todo-item-3')).toBeVisible();
    await page.getByTestId('todo-delete-3').click();
    await expect(page.getByTestId('todo-list')).toBeEmpty();
    await expect(page.getByTestId('empty-state')).toBeVisible();

    await page.getByTestId('todo-input').fill('Reload-reset task');
    await page.getByTestId('add-button').click();
    await expect(page.getByTestId('todo-list')).toContainText('Reload-reset task');
    await page.reload();
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('todo-list')).toBeEmpty();
    await expect(page.getByText('Reload-reset task')).toHaveCount(0);

    expect(browserIssues).toEqual([]);
  });
});
