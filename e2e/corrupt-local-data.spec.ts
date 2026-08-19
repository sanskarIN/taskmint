import { expect, test } from '@playwright/test';

test('fails closed when current IndexedDB data is malformed', async ({ page }) => {
  await page.goto('/taskmint-icon.svg');

  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('taskmint');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error('Could not delete test database.'));
      request.onblocked = () => reject(new Error('Test database deletion was blocked.'));
    });

    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('taskmint', 20);
      request.onupgradeneeded = () => {
        const database = request.result;
        const tasks = database.createObjectStore('tasks', { keyPath: 'id' });
        tasks.createIndex('status', 'status');
        tasks.createIndex('dueDate', 'dueDate');
        tasks.createIndex('reminderAt', 'reminderAt');
        tasks.createIndex('project', 'project');
        tasks.createIndex('priority', 'priority');
        tasks.createIndex('order', 'order');
        tasks.createIndex('createdAt', 'createdAt');
        tasks.createIndex('updatedAt', 'updatedAt');
        tasks.createIndex('tags', 'tags', { multiEntry: true });
        database.createObjectStore('settings', { keyPath: 'key' });
      };
      request.onerror = () => reject(request.error ?? new Error('Could not create corrupt fixture.'));
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction(['tasks', 'settings'], 'readwrite');
        transaction.objectStore('tasks').put({
          id: 'corrupt-task',
          title: 'Corrupt task',
          notes: '',
          priority: 'medium',
          dueDate: null,
          reminderAt: '2026-02-31T10:00:00Z',
          tags: [],
          project: '',
          recurrence: 'none',
          status: 'active',
          completedAt: null,
          archivedAt: null,
          createdAt: '2026-08-19T06:00:00.000Z',
          updatedAt: '2026-08-19T06:00:00.000Z',
          order: 1000
        });
        transaction.objectStore('settings').put({
          key: 'app',
          theme: 'system',
          onboardingComplete: true,
          reduceMotion: false,
          notificationsEnabled: false
        });
        transaction.oncomplete = () => {
          database.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error ?? new Error('Corrupt seed failed.'));
        transaction.onabort = () => reject(transaction.error ?? new Error('Corrupt seed aborted.'));
      };
    });
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Could not safely load local TaskMint data.' })).toBeVisible();
  await expect(page.getByText(/existing browser data was left in place/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reload TaskMint' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add task' })).toHaveCount(0);
  await expect(page.getByPlaceholder('What needs to be done?')).toHaveCount(0);
});
