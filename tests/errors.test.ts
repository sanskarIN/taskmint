import { describe, expect, it } from 'vitest';
import { TaskMintError, type TaskMintErrorCode } from '../src/domain/errors';
import { createTask } from '../src/domain/task';
import { csvToTasks, parseBackup } from '../src/utils/export';

function expectTaskMintError(
  action: () => unknown,
  code: TaskMintErrorCode,
  message: RegExp
): void {
  try {
    action();
    throw new Error('Expected TaskMintError to be thrown.');
  } catch (error) {
    expect(error).toBeInstanceOf(TaskMintError);
    const taskMintError = error as TaskMintError;
    expect(taskMintError.code).toBe(code);
    expect(taskMintError.message).toMatch(message);
  }
}

describe('typed user-safe errors', () => {
  it('assigns a stable code to task validation failures', () => {
    expectTaskMintError(
      () => createTask({ title: '   ' }),
      'task-title-required',
      /task title is required/i
    );
  });

  it('wraps malformed JSON with a stable safe backup error', () => {
    expectTaskMintError(
      () => parseBackup('{not-json'),
      'backup-json-invalid',
      /not valid json/i
    );
  });

  it('assigns row-aware codes to malformed CSV input', () => {
    const csv =
      'title,notes,priority,dueDate,reminderAt,tags,project,recurrence,status\r\n' +
      'Read docs,,impossible,,,study,,none,active';
    expectTaskMintError(
      () => csvToTasks(csv),
      'csv-invalid-priority',
      /row 2.*priority/i
    );
  });

  it('freezes structured error details to prevent accidental mutation', () => {
    const error = new TaskMintError('task-title-too-long', { max: 240 });
    expect(Object.isFrozen(error.details)).toBe(true);
    expect(error.details).toEqual({ max: 240 });
  });
});
