import { expect, test } from '@playwright/test';

test('supports global search and new-task keyboard shortcuts', async ({ page }) => {
  await page.goto('/');
  const start = page.getByRole('button', { name: 'Start using TaskMint' });
  if (await start.isVisible()) await start.click();

  await page.keyboard.press('Control+K');
  const search = page.getByPlaceholder('Search tasks, notes, tags, or projects…');
  await expect(search).toBeFocused();

  await page.keyboard.press('Escape');
  await page.locator('body').click({ position: { x: 1, y: 1 } });
  await page.keyboard.press('n');
  await expect(page.getByPlaceholder('What needs to be done?')).toBeFocused();
});

test('does not steal the new-task shortcut while typing', async ({ page }) => {
  await page.goto('/');
  const start = page.getByRole('button', { name: 'Start using TaskMint' });
  if (await start.isVisible()) await start.click();

  const search = page.getByPlaceholder('Search tasks, notes, tags, or projects…');
  await search.focus();
  await page.keyboard.type('n');
  await expect(search).toHaveValue('n');
  await expect(search).toBeFocused();
});
