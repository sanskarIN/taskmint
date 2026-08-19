import { expect, test } from '@playwright/test';

test('exposes labeled interactive controls and core landmarks', async ({ page }) => {
  await page.goto('/');
  const start = page.getByRole('button', { name: 'Start using TaskMint' });
  if (await start.isVisible()) await start.click();

  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('navigation')).toBeVisible();

  const unnamedButtons = await page.locator('button').evaluateAll((buttons) =>
    buttons.filter((button) => {
      const ariaLabel = button.getAttribute('aria-label')?.trim() ?? '';
      const text = button.textContent?.trim() ?? '';
      return !ariaLabel && !text;
    }).length
  );
  expect(unnamedButtons).toBe(0);

  const unlabeledFields = await page
    .locator('input:not([type="file"]), select, textarea')
    .evaluateAll((fields) =>
      fields.filter((field) => {
        const element = field as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        const ariaLabel = element.getAttribute('aria-label')?.trim() ?? '';
        const ariaLabelledBy = element.getAttribute('aria-labelledby')?.trim() ?? '';
        const placeholder = 'placeholder' in element ? element.placeholder.trim() : '';
        const parentLabel = element.closest('label')?.textContent?.trim() ?? '';
        const explicitLabel = element.id
          ? document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(element.id)}"]`)?.textContent?.trim() ?? ''
          : '';
        return !ariaLabel && !ariaLabelledBy && !placeholder && !parentLabel && !explicitLabel;
      }).length
    );
  expect(unlabeledFields).toBe(0);

  await expect(page.getByPlaceholder('Search tasks, notes, tags, or projects…')).toHaveAttribute(
    'aria-keyshortcuts',
    /Control\+K/
  );
  await expect(page.getByPlaceholder('What needs to be done?')).toHaveAttribute(
    'aria-keyshortcuts',
    'N'
  );
});
