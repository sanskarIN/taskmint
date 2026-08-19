import { describe, expect, it } from 'vitest';
import { createTask } from '../src/domain/task';
import { csvToTasks, parseBackup, serializeBackup, tasksToCsv } from '../src/utils/export';

describe('data portability', () => {
  it('round-trips JSON backups', () => {
    const task = createTask({ title: 'Back up data', notes: 'Keep it local' });
    const parsed = parseBackup(serializeBackup([task]));
    expect(parsed.tasks).toHaveLength(1);
    expect(parsed.tasks[0]?.title).toBe('Back up data');
  });

  it('round-trips CSV fields containing commas and quotes', () => {
    const task = createTask({ title: 'Buy, then "check"', notes: 'line one\nline two', tags: ['home', 'errand'] });
    const imported = csvToTasks(tasksToCsv([task]));
    expect(imported[0]?.title).toBe(task.title);
    expect(imported[0]?.notes).toBe(task.notes);
    expect(imported[0]?.tags).toEqual(['home', 'errand']);
  });

  it('rejects unsupported JSON backups', () => {
    expect(() => parseBackup('{"app":"Other","schemaVersion":2,"tasks":[]}')).toThrow(/unsupported/i);
  });
});
