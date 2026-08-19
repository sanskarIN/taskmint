import { describe, expect, it } from 'vitest';
import { csvToTasks } from '../src/utils/export';

const header = 'title,notes,priority,dueDate,reminderAt,tags,project,recurrence,status\r\n';

describe('strict CSV quoting', () => {
  it('rejects a quote embedded in an unquoted field', () => {
    const csv = `${header}Bad"title,,medium,,,,,none,active`;
    expect(() => csvToTasks(csv)).toThrow(/row 2.*invalid quote placement/i);
  });

  it('rejects characters after a quoted field closes', () => {
    const csv = `${header}"Closed"junk,,medium,,,,,none,active`;
    expect(() => csvToTasks(csv)).toThrow(/row 2.*invalid quote placement/i);
  });

  it('accepts escaped quotes inside a quoted field', () => {
    const csv = `${header}"Quoted ""title""",,medium,,,,,none,active`;
    expect(csvToTasks(csv)[0]?.title).toBe('Quoted "title"');
  });
});
