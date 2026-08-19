import { describe, expect, it, vi } from 'vitest';
import { createTask } from '../src/domain/task';
import type { AppSettings, Task } from '../src/domain/types';
import type { TaskMintDatabase } from '../src/storage/db';
import { TaskRepository, defaultSettings } from '../src/storage/repository';

function repositoryHarness() {
  const bulkPut = vi.fn(async (_tasks: Task[]) => undefined);
  const toArray = vi.fn(async (): Promise<Task[]> => []);
  const getSettings = vi.fn(async (): Promise<AppSettings | undefined> => undefined);
  const transaction = vi.fn(
    async (_mode: string, _table: unknown, scope: () => Promise<void>): Promise<void> => {
      await scope();
    }
  );
  const database = {
    tasks: { bulkPut, toArray },
    settings: { get: getSettings },
    transaction
  } as unknown as TaskMintDatabase;
  return {
    repository: new TaskRepository(database),
    bulkPut,
    toArray,
    getSettings,
    transaction
  };
}

describe('TaskRepository validated reads', () => {
  it('returns validated local tasks', async () => {
    const { repository, toArray } = repositoryHarness();
    const task = createTask({ title: 'Stored task' }, new Date('2026-08-19T06:00:00.000Z'));
    toArray.mockResolvedValueOnce([task]);

    await expect(repository.listTasks()).resolves.toEqual([task]);
  });

  it('rejects malformed local tasks without rewriting them', async () => {
    const { repository, toArray } = repositoryHarness();
    const task = createTask({ title: 'Corrupt reminder' });
    toArray.mockResolvedValueOnce([{ ...task, reminderAt: '2026-02-31T10:00:00Z' }]);

    await expect(repository.listTasks()).rejects.toThrow(/reminderAt/i);
  });

  it('returns default settings when no local settings row exists', async () => {
    const { repository } = repositoryHarness();
    await expect(repository.getSettings()).resolves.toEqual(defaultSettings);
  });

  it('rejects malformed local settings', async () => {
    const { repository, getSettings } = repositoryHarness();
    getSettings.mockResolvedValueOnce({ ...defaultSettings, theme: 'neon' as AppSettings['theme'] });

    await expect(repository.getSettings()).rejects.toThrow(/theme/i);
  });
});

describe('TaskRepository bulk persistence', () => {
  it('wraps bulk task writes in a read-write transaction', async () => {
    const { repository, bulkPut, transaction } = repositoryHarness();
    const tasks = [createTask({ title: 'Atomic one' }), createTask({ title: 'Atomic two' })];

    await repository.putTasks(tasks);

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction.mock.calls[0]?.[0]).toBe('rw');
    expect(bulkPut).toHaveBeenCalledWith(tasks);
  });

  it('propagates bulk failures instead of reporting a successful write', async () => {
    const { repository, bulkPut } = repositoryHarness();
    bulkPut.mockRejectedValueOnce(new Error('simulated bulk failure'));

    await expect(repository.putTasks([createTask({ title: 'Will fail' })])).rejects.toThrow(
      /simulated bulk failure/i
    );
  });

  it('does not open an IndexedDB transaction for an empty batch', async () => {
    const { repository, bulkPut, transaction } = repositoryHarness();

    await repository.putTasks([]);

    expect(transaction).not.toHaveBeenCalled();
    expect(bulkPut).not.toHaveBeenCalled();
  });
});
