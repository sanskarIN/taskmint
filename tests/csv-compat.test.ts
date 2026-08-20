import { describe, expect, it } from 'vitest';
import { TASK_LIMITS } from '../src/domain/limits';
import { createTask } from '../src/domain/task';
import { csvToTasks, tasksToCsv } from '../src/utils/export';

describe('CSV encoding compatibility', () => {
  it('treats json-prefixed legacy tags as plain legacy tag text', () => {
    const csv =
      'title,notes,priority,dueDate,reminderAt,tags,project,recurrence,status\r\n' +
      'Legacy prefix,,medium,,,json:release|stable,,none,active';

    expect(csvToTasks(csv)[0]?.tags).toEqual(['json:release', 'stable']);
  });

  it('uses structured JSON tag decoding only for TaskMint encoded rows', () => {
    const task = createTask({ title: 'Structured tags', tags: ['ci|cd', 'json:release'] });
    expect(csvToTasks(tasksToCsv([task]))[0]?.tags).toEqual(task.tags);
  });

  it('rejects malformed structured tags on TaskMint encoded rows', () => {
    const csv =
      'title,notes,priority,dueDate,reminderAt,tags,project,recurrence,status,taskmintEncoding\r\n' +
      'Broken tags,,medium,,,json:not-json,,none,active,safe-text-v1';

    expect(() => csvToTasks(csv)).toThrow(/row 2.*invalid structured tag field/i);
  });

  it('rejects unknown non-empty TaskMint encoding versions', () => {
    const csv =
      'title,notes,priority,dueDate,reminderAt,tags,project,recurrence,status,taskmintEncoding\r\n' +
      'Future encoding,,medium,,,json:["tag"],,none,active,safe-text-v99';

    expect(() => csvToTasks(csv)).toThrow(/row 2.*unsupported TaskMint encoding/i);
  });

  it('keeps the original CSV record number after blank records are skipped', () => {
    const csv =
      'title,notes,priority,dueDate,reminderAt,tags,project,recurrence,status\r\n' +
      ',,,,,,,,\r\n' +
      'Broken priority,,impossible,,,,,none,active';

    expect(() => csvToTasks(csv)).toThrow(/row 3.*invalid priority/i);
  });

  it('assigns contiguous caller-provided orders across skipped blank records', () => {
    const csv =
      'title,notes,priority,dueDate,reminderAt,tags,project,recurrence,status\r\n' +
      ',,,,,,,,\r\n' +
      'First import,,medium,,,,,none,active\r\n' +
      'Second import,,medium,,,,,none,active';

    expect(csvToTasks(csv, 5000).map((task) => task.order)).toEqual([5000, 5001]);
  });

  it('does not count blank logical records toward the task-count limit', () => {
    const header = 'title,notes,priority,dueDate,reminderAt,tags,project,recurrence,status';
    const csv = `${header}\r\n${'\r\n'.repeat(TASK_LIMITS.backupTasks + 1)}`;

    expect(csvToTasks(csv)).toEqual([]);
  });
});
