import { describe, expect, it, vi } from 'vitest';
import { createTask } from '../src/domain/task';
import type { AppSettings, Task, TaskBackup } from '../src/domain/types';
import type { TaskMintDatabase } from '../src/storage/db';
import { TaskRepository, defaultSettings } from '../src/storage/repository';

function repositoryHarness() {
  const putTask = vi.fn<(task: Task) => Promise<void>>().mockResolvedValue(undefined);
  const bulkPut = vi.fn<(tasks: Task[]) => Promise<void>>().mockResolvedValue(undefined);
  const deleteTask = vi.fn<(id: string) => Promise<void>>().mockResolvedValue(undefined);
  const clearTasks = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  const toArray = vi.fn<() => Promise<Task[]>>().mockResolvedValue([]);
  const getSettings = vi.fn<() => Promise<AppSettings | undefined>>().mockResolvedValue(undefined);
  const putSettings = vi.fn<(settings: AppSettings) => Promise<void>>().mockResolvedValue(undefined);
  const clearSettings = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  const transaction = vi.fn(async (...args: unknown[]): Promise<void> => {
    const scope = args.at(-1);
    if (typeof scope !== 'function') throw new Error('missing transaction scope');
    await (scope as () => Promise<void>)();
  });
  const database = {
    tasks: { put: putTask, bulkPut, delete: deleteTask, clear: clearTasks, toArray },
    settings: { get: getSettings, put: putSettings, clear: clearSettings },
    transaction
  } as unknown as TaskMintDatabase;
  return {
    repository: new TaskRepository(database),
    putTask,
    bulkPut,
    deleteTask,
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
    const { repository, putTask, transaction } = repositoryHarness();
    const malformed = {
      ...createTask({ title: 'Invalid write' }),
      reminderAt: '2026-02-31T10:00:00Z'
    };

    await expect(repository.putTask(malformed)).rejects.toThrow(/reminderAt/i);
    expect(transaction).not.toHaveBeenCalled();
    expect(putTask).not.toHaveBeenCalled();
  });

  it('wraps valid single-task writes in a read-write transaction', async () => {
    const { repository, putTask, transaction } = repositoryHarness();
    const task = createTask({ title: 'Committed task' });

    await repository.putTask(task);

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction.mock.calls[0]?.[0]).toBe('rw');
    expect(putTask).toHaveBeenCalledWith(task);
  });

  it('wraps task deletion in a read-write transaction', async () => {
    const { repository, deleteTask, transaction } = repositoryHarness();

    await repository.deleteTask('task-to-delete');

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction.mock.calls[0]?.[0]).toBe('rw');
    expect(deleteTask).toHaveBeenCalledWith('task-to-delete');
  });

  it('rejects malformed settings before writing them', async () => {
    const { repository, putSettings, transaction } = repositoryHarness();
    const malformed = { ...defaultSettings, theme: 'neon' as AppSettings['theme'] };

    await expect(repository.saveSettings(malformed)).rejects.toThrow(/theme/i);
    expect(transaction).not.toHaveBeenCalled();
    expect(putSettings).not.toHaveBeenCalled();
  });

  it('wraps valid settings writes in a read-write transaction', async () => {
    const { repository, putSettings, transaction } = repositoryHarness();
    const settings = { ...defaultSettings, onboardingComplete: true };

    await repository.saveSettings(settings);

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction.mock.calls[0]?.[0]).toBe('rw');
    expect(putSettings).toHaveBeenCalledWith(settings);
  });

  it('does not resolve a settings write until the transaction reports commit completion', async () => {
    const { repository, putSettings, transaction } = repositoryHarness();
    let releaseCommit: (() => void) | undefined;
    transaction.mockImplementationOnce(async (...args: unknown[]) => {
      const scope = args.at(-1);
      if (typeof scope !== 'function') throw new Error('missing transaction scope');
      await (scope as () => Promise<void>)();
      await new Promise<void>((resolve) => {
        releaseCommit = resolve;
      });
    });

    let resolved = false;
    const pending = repository
      .saveSettings({ ...defaultSettings, onboardingComplete: true })
      .then(() => {
        resolved = true;
      });

    await vi.waitFor(() => expect(putSettings).toHaveBeenCalledTimes(1));
    expect(resolved).toBe(false);

    releaseCommit?.();
    await pending;
    expect(resolved).toBe(true);
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

  it('rejects duplicate ids before opening a transaction', async () => {
    const { repository, bulkPut, transaction } = repositoryHarness();
    const first = createTask({ title: 'First duplicate' });
    const second = { ...createTask({ title: 'Second duplicate' }), id: first.id };

    await expect(repository.putTasks([first, second])).rejects.toThrow(/duplicate task id/i);
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
