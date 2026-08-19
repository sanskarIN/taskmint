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
    const task = createTask({
      title: 'Buy, then "check"',
      notes: 'line one\nline two',
      tags: ['home', 'errand']
    });
    const imported = csvToTasks(tasksToCsv([task]));
    expect(imported[0]?.title).toBe(task.title);
    expect(imported[0]?.notes).toBe(task.notes);
    expect(imported[0]?.tags).toEqual(['home', 'errand']);
  });

  it('accepts a UTF-8 BOM before the first CSV header', () => {
    const csv =
      '\uFEFFtitle,notes,priority,dueDate,reminderAt,tags,project,recurrence,status\r\n' +
      'Read docs,,medium,,,study,,none,active';
    expect(csvToTasks(csv)[0]?.title).toBe('Read docs');
  });

  it('rejects invalid CSV enums instead of silently coercing them', () => {
    const csv =
      'title,notes,priority,dueDate,reminderAt,tags,project,recurrence,status\r\n' +
      'Read docs,,impossible,,,study,,none,active';
    expect(() => csvToTasks(csv)).toThrow(/row 2.*priority/i);
  });

  it('rejects invalid CSV dates instead of silently dropping them', () => {
    const csv =
      'title,notes,priority,dueDate,reminderAt,tags,project,recurrence,status\r\n' +
      'Read docs,,medium,2026-02-31,,study,,none,active';
    expect(() => csvToTasks(csv)).toThrow(/row 2.*due date/i);
  });

  it('rejects duplicate CSV headers', () => {
    const csv =
      'title,title,notes,priority,dueDate,reminderAt,tags,project,recurrence,status\r\n' +
      'Read docs,Other,,medium,,,study,,none,active';
    expect(() => csvToTasks(csv)).toThrow(/duplicate columns/i);
  });

  it('rejects unsupported JSON backups', () => {
    expect(() => parseBackup('{"app":"Other","schemaVersion":2,"tasks":[]}')).toThrow(
      /unsupported/i
    );
  });

  it('rejects duplicate task ids', () => {
    const task = createTask({ title: 'Unique task' });
    const duplicateBackup = JSON.stringify({
      app: 'TaskMint',
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      tasks: [task, task]
    });
    expect(() => parseBackup(duplicateBackup)).toThrow(/duplicate task id/i);
  });

  it('rejects malformed task timestamps', () => {
    const task = { ...createTask({ title: 'Bad reminder' }), reminderAt: 'not-a-date' };
    const malformedBackup = JSON.stringify({
      app: 'TaskMint',
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      tasks: [task]
    });
    expect(() => parseBackup(malformedBackup)).toThrow(/reminderAt/i);
  });

  it('rejects oversized backup fields instead of truncating them', () => {
    const task = { ...createTask({ title: 'Long project' }), project: 'x'.repeat(81) };
    const backup = JSON.stringify({
      app: 'TaskMint',
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      tasks: [task]
    });
    expect(() => parseBackup(backup)).toThrow(/project/i);
  });
});
