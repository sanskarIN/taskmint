import { expect, test } from '@playwright/test';

test('backs up, deletes, and restores local tasks with JSON', async ({ page }) => {
  await page.goto('/');
  const start = page.getByRole('button', { name: 'Start using TaskMint' });
  if (await start.isVisible()) await start.click();

  await page.getByPlaceholder('What needs to be done?').fill('Backup round trip');
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect(page.getByText('Backup round trip')).toBeVisible();

  await page.getByRole('button', { name: 'Settings' }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Backup JSON' }).click()
  ]);
  const backupPath = await download.path();
  if (!backupPath) throw new Error('Playwright did not provide the downloaded backup path.');

  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Delete all local data' }).click();
  await expect(page.getByText('All local TaskMint data was deleted.')).toBeVisible();

  const jsonInput = page.locator('input[type="file"][accept*=".json"]');
  await jsonInput.setInputFiles(backupPath);
  await expect(page.getByText('Restored 1 tasks.')).toBeVisible();

  await page.getByRole('button', { name: 'Close settings' }).click();
  await expect(page.getByText('Backup round trip')).toBeVisible();
});
