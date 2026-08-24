import { expect, test } from '@playwright/test';

async function completeOnboarding(page: import('@playwright/test').Page) {
  const start = page.getByRole('button', { name: 'Start using TaskMint' });
  await expect(start).toBeVisible();
  await start.click();
  await expect(start).toBeHidden();
}

test('supports global search and new-task keyboard shortcuts', async ({ page }) => {
  await page.goto('/');
  await completeOnboarding(page);

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
  await completeOnboarding(page);

  const search = page.getByPlaceholder('Search tasks, notes, tags, or projects…');
  await search.focus();
  await page.keyboard.type('n');
  await expect(search).toHaveValue('n');
  await expect(search).toBeFocused();
});
