import { describe, expect, it } from 'vitest';
import { parseStrictDateTime } from '../src/domain/datetime';
import { createTask } from '../src/domain/task';
import { parseBackup, serializeBackup } from '../src/utils/export';

describe('strict datetime validation', () => {
  it('rejects impossible calendar dates instead of allowing Date rollover', () => {
    expect(parseStrictDateTime('2026-02-31T10:00')).toBeNull();
    expect(() => createTask({ title: 'Impossible reminder', reminderAt: '2026-02-31T10:00' })).toThrow(
      /reminder date\/time is invalid/i
    );
  });

  it('accepts valid leap-day and offset timestamps', () => {
    expect(parseStrictDateTime('2024-02-29T23:59')).not.toBeNull();
    expect(parseStrictDateTime('2026-08-19T12:30:45.123+05:30')?.toISOString()).toBe(
      '2026-08-19T07:00:45.123Z'
    );
  });

  it('rejects impossible timestamps inside JSON backups', () => {
    const task = createTask({ title: 'Backup timestamp' });
    const backup = JSON.parse(serializeBackup([task])) as {
      tasks: Array<Record<string, unknown>>;
    };
    backup.tasks[0]!.createdAt = '2026-02-31T10:00:00Z';
    expect(() => parseBackup(JSON.stringify(backup))).toThrow(/createdAt/i);
  });

  it('keeps canonical exported timestamps valid', () => {
    const task = createTask({ title: 'Valid backup' }, new Date('2026-08-19T06:00:00.000Z'));
    expect(parseBackup(serializeBackup([task])).tasks[0]?.createdAt).toBe(
      '2026-08-19T06:00:00.000Z'
    );
  });
});
