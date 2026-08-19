import { describe, expect, it, vi } from 'vitest';
import { createTask } from '../src/domain/task';
import type { AppSettings, Task, TaskBackup } from '../src/domain/types';
import type { TaskMintDatabase } from '../src/storage/db';
import { TaskRepository, defaultSettings } from '../src/storage/repository';

function repositoryHarness() {
  const putTask = vi.fn(async (_task: Task) => undefined);
  const bulkPut = vi.fn(async (_tasks: Task[]) => undefined);
  const clearTasks = vi.fn(async () => undefined);
  const toArray = vi.fn(async (): Promise<Task[]> => []);
  const getSettings = vi.fn(async (): Promise<AppSettings | undefined> => undefined);
  const putSettings = vi.fn(async (_settings: AppSettings) => undefined);
  const clearSettings = vi.fn(async () => undefined);
  const transaction = vi.fn(async (...args: unknown[]): Promise<void> => {
    const scope = args.at(-1);
    if (typeof scope !== 'function') throw new Error('missing transaction scope');
    await (scope as () => Promise<void>)();
  });
  const database = {
    tasks: { put: putTask, bulkPut, clear: clearTasks, toArray },
    settings: { get: getSettings, put: putSettings, clear: clearSettings },
    transaction
  } as unknown as TaskMintDatabase;
  return {
    repository: new TaskRepository(database),
    putTask,
    bulkPut,
    clearTasks,
    toArray,
    getSettings,
    putSettings,
    clearSettings,
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

describe('TaskRepository validated writes', () => {
  it('rejects a malformed single task before writing it', async () => {
    const { repository, putTask } = repositoryHarness();
    const malformed = {
      ...createTask({ title: 'Invalid write' }),
      reminderAt: '2026-02-31T10:00:00Z'
    };

    await expect(repository.putTask(malformed)).rejects.toThrow(/reminderAt/i);
    expect(putTask).not.toHaveBeenCalled();
  });

  it('rejects malformed settings before writing them', async () => {
    const { repository, putSettings } = repositoryHarness();
    const malformed = { ...defaultSettings, theme: 'neon' as AppSettings['theme'] };

    await expect(repository.saveSettings(malformed)).rejects.toThrow(/theme/i);
    expect(putSettings).not.toHaveBeenCalled();
  });

  it('validates a restore completely before opening its destructive transaction', async () => {
    const { repository, transaction, clearTasks, clearSettings } = repositoryHarness();
    const malformed = {
      app: 'TaskMint',
      schemaVersion: 2,
      exportedAt: '2026-08-19T08:00:00.000Z',
      tasks: [{ ...createTask({ title: 'Invalid restore' }), order: 1.5 }]
    } as TaskBackup;

    await expect(repository.restoreBackup(malformed)).rejects.toThrow(/order/i);
    expect(transaction).not.toHaveBeenCalled();
    expect(clearTasks).not.toHaveBeenCalled();
    expect(clearSettings).not.toHaveBeenCalled();
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

  it('validates the whole batch before opening a transaction', async () => {
    const { repository, bulkPut, transaction } = repositoryHarness();
    const valid = createTask({ title: 'Valid' });
    const malformed = { ...createTask({ title: 'Invalid' }), order: 1.5 };

    await expect(repository.putTasks([valid, malformed])).rejects.toThrow(/order/i);
    expect(transaction).not.toHaveBeenCalled();
    expect(bulkPut).not.toHaveBeenCalled();
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
