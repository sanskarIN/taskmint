import { expect, test } from '@playwright/test';

test('progressively renders large task result sets', async ({ page }) => {
  await page.goto('/');
  const start = page.getByRole('button', { name: 'Start using TaskMint' });
  if (await start.isVisible()) await start.click();

  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('taskmint');
      request.onerror = () => reject(request.error ?? new Error('Could not open TaskMint database.'));
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction('tasks', 'readwrite');
        const store = transaction.objectStore('tasks');
        const now = new Date('2026-08-19T04:00:00.000Z').toISOString();
        for (let index = 0; index < 101; index += 1) {
          store.put({
            id: `pagination-${index}`,
            title: `Pagination task ${String(index + 1).padStart(3, '0')}`,
            notes: '',
            priority: 'medium',
            dueDate: null,
            reminderAt: null,
            tags: [],
            project: '',
            recurrence: 'none',
            status: 'active',
            completedAt: null,
            archivedAt: null,
            createdAt: now,
            updatedAt: now,
            order: index * 1000
          });
        }
        transaction.oncomplete = () => {
          database.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error ?? new Error('Pagination seed failed.'));
        transaction.onabort = () => reject(transaction.error ?? new Error('Pagination seed aborted.'));
      };
    });
  });

  await page.reload();
  await expect(page.locator('.task-card')).toHaveCount(100);
  const showMore = page.getByRole('button', { name: 'Show more tasks (1 remaining)' });
  await expect(showMore).toBeVisible();
  await showMore.click();
  await expect(page.locator('.task-card')).toHaveCount(101);
  await expect(showMore).toBeHidden();
});
