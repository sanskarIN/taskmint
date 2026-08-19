import { expect, test } from '@playwright/test';

test('creates and completes a task offline-first', async ({ page, context }) => {
  await page.goto('/');
  const start = page.getByRole('button', { name: 'Start using TaskMint' });
  if (await start.isVisible()) await start.click();

  await page.getByPlaceholder('What needs to be done?').fill('Plan the week');
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect(page.getByText('Plan the week')).toBeVisible();

  await context.setOffline(true);
  await expect(page.getByText('Offline')).toBeVisible();
  await page.getByRole('button', { name: 'Complete Plan the week' }).click();
  await page.getByRole('button', { name: 'Completed' }).click();
  await expect(page.getByText('Plan the week')).toBeVisible();
});
