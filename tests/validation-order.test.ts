import { describe, expect, it } from 'vitest';
import { createTask } from '../src/domain/task';
import { compareTaskOrder } from '../src/domain/order';
import { parseBackup, serializeBackup } from '../src/utils/export';

describe('persisted task order integrity', () => {
  it('rejects unsafe integer order values in backups', () => {
    const task = createTask({ title: 'Unsafe persisted order' });
    const backup = JSON.parse(serializeBackup([task])) as {
      tasks: Array<Record<string, unknown>>;
    };
    backup.tasks[0]!.order = Number.MAX_SAFE_INTEGER + 1;

    expect(() => parseBackup(JSON.stringify(backup))).toThrow(/task order/i);
  });

  it('normalizes duplicate safe order values without changing deterministic visible order', () => {
    const now = new Date('2026-08-19T06:00:00.000Z');
    const first = { ...createTask({ title: 'First' }, now, 1000), id: 'b' };
    const second = { ...createTask({ title: 'Second' }, now, 1000), id: 'a' };
    const parsed = parseBackup(serializeBackup([first, second]));

    expect([...parsed.tasks].sort(compareTaskOrder).map((task) => task.id)).toEqual(['a', 'b']);
    expect(new Set(parsed.tasks.map((task) => task.order)).size).toBe(2);
  });
});
