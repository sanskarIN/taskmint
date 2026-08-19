import { describe, expect, it } from 'vitest';
import { createTask } from '../src/domain/task';
import { csvToTasks, tasksToCsv } from '../src/utils/export';

describe('CSV spreadsheet text safety', () => {
  it('neutralizes formulas after leading whitespace before normal CSV task normalization', () => {
    const task = createTask({ title: 'Safe title', notes: 'temporary' });
    const restoredLikeTask = {
      ...task,
      notes: ' \t=SUM(A1:A2)'
    };

    const csv = tasksToCsv([restoredLikeTask]);
    expect(csv).toContain("' \t=SUM(A1:A2)");
    expect(csvToTasks(csv)[0]?.notes).toBe(restoredLikeTask.notes.trim());
  });

  it('neutralizes newline-prefixed formulas from validated backup-shaped task data', () => {
    const task = createTask({ title: 'Safe title', notes: 'temporary' });
    const restoredLikeTask = {
      ...task,
      notes: '\n@SUM(A1:A2)'
    };

    const csv = tasksToCsv([restoredLikeTask]);
    expect(csv).toContain("'\n@SUM(A1:A2)");
    expect(csvToTasks(csv)[0]?.notes).toBe(restoredLikeTask.notes.trim());
  });
});
