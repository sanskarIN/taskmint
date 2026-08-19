import { expect, test } from '@playwright/test';

test('migrates legacy IndexedDB tasks to schema v2', async ({ page }) => {
  await page.goto('/taskmint-icon.svg');

  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('taskmint');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error('Could not delete test database.'));
      request.onblocked = () => reject(new Error('Test database deletion was blocked.'));
    });

    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('taskmint', 10);
      request.onupgradeneeded = () => {
        const database = request.result;
        const tasks = database.createObjectStore('tasks', { keyPath: 'id' });
        tasks.createIndex('status', 'status');
        tasks.createIndex('dueDate', 'dueDate');
        tasks.createIndex('project', 'project');
        tasks.createIndex('priority', 'priority');
        tasks.createIndex('order', 'order');
        tasks.createIndex('createdAt', 'createdAt');
        database.createObjectStore('settings', { keyPath: 'key' });
      };
      request.onerror = () => reject(request.error ?? new Error('Could not create legacy database.'));
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction(['tasks'], 'readwrite');
        transaction.objectStore('tasks').put({
          id: 'legacy-task',
          title: 'Legacy task',
          notes: '',
          priority: 'medium',
          dueDate: null,
          project: '',
          status: 'active',
          completedAt: null,
          archivedAt: null,
          createdAt: '2026-08-19T03:00:00.000Z',
          updatedAt: '2026-08-19T03:00:00.000Z',
          order: 1000
        });
        transaction.oncomplete = () => {
          database.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error ?? new Error('Legacy seed failed.'));
        transaction.onabort = () => reject(transaction.error ?? new Error('Legacy seed aborted.'));
      };
    });
  });

  await page.goto('/');
  await expect(page.getByText('Legacy task')).toBeVisible();

  const migrated = await page.evaluate(async () => {
    return new Promise<Record<string, unknown>>((resolve, reject) => {
      const request = indexedDB.open('taskmint');
      request.onerror = () => reject(request.error ?? new Error('Could not inspect migrated database.'));
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction('tasks', 'readonly');
        const getRequest = transaction.objectStore('tasks').get('legacy-task');
        getRequest.onsuccess = () => {
          const value = getRequest.result as Record<string, unknown>;
          database.close();
          resolve(value);
        };
        getRequest.onerror = () => reject(getRequest.error ?? new Error('Could not read migrated task.'));
      };
    });
  });

  expect(migrated).toMatchObject({
    reminderAt: null,
    tags: [],
    project: '',
    recurrence: 'none'
  });
});
