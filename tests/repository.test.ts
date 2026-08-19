import { describe, expect, it, vi } from 'vitest';
import { createTask } from '../src/domain/task';
import type { Task } from '../src/domain/types';
import type { TaskMintDatabase } from '../src/storage/db';
import { TaskRepository } from '../src/storage/repository';

function repositoryHarness() {
  const bulkPut = vi.fn(async (_tasks: Task[]) => undefined);
  const transaction = vi.fn(
    async (_mode: string, _table: unknown, scope: () => Promise<void>): Promise<void> => {
      await scope();
    }
  );
  const database = {
    tasks: { bulkPut },
    transaction
  } as unknown as TaskMintDatabase;
  return { repository: new TaskRepository(database), bulkPut, transaction };
}

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
