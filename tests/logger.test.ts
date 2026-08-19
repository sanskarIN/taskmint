import { describe, expect, it, vi } from 'vitest';
import { TaskMintError } from '../src/domain/errors';
import { logError, logEvent } from '../src/utils/logger';

describe('development logger privacy', () => {
  it('does not log arbitrary Error.message text', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    logError('storage_failed', new Error('Sensitive task title: private plan'));

    const serialized = JSON.stringify(errorSpy.mock.calls);
    expect(serialized).not.toContain('Sensitive task title');
    expect(serialized).not.toContain('private plan');
    if (import.meta.env.DEV) {
      expect(errorSpy).toHaveBeenCalledWith('[TaskMint] storage_failed', { kind: 'Error' });
    }
  });

  it('logs only the stable code for TaskMintError diagnostics', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    logError('backup_failed', new TaskMintError('backup-json-invalid'));

    const serialized = JSON.stringify(errorSpy.mock.calls);
    expect(serialized).not.toContain('Backup is not valid JSON');
    if (import.meta.env.DEV) {
      expect(errorSpy).toHaveBeenCalledWith('[TaskMint] backup_failed', {
        kind: 'TaskMintError',
        code: 'backup-json-invalid'
      });
    }
  });

  it('keeps stable scalar diagnostics while redacting arbitrary strings and objects', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    logEvent('task_changed', {
      taskId: 'task-123',
      recurring: true,
      count: 2,
      detail: 'private task title',
      nested: { title: 'secret plan' }
    });

    const serialized = JSON.stringify(infoSpy.mock.calls);
    expect(serialized).not.toContain('private task title');
    expect(serialized).not.toContain('secret plan');
    if (import.meta.env.DEV) {
      expect(infoSpy).toHaveBeenCalledWith('[TaskMint] task_changed', {
        taskId: 'task-123',
        recurring: true,
        count: 2,
        detail: '[REDACTED]',
        nested: '[REDACTED]'
      });
    }
  });

  it('redacts unsafe identifier strings and explicitly sensitive keys', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    logEvent('task_changed', {
      taskId: 'task-123 private title',
      title: 'hidden title',
      notes: 'hidden notes'
    });

    const serialized = JSON.stringify(infoSpy.mock.calls);
    expect(serialized).not.toContain('private title');
    expect(serialized).not.toContain('hidden title');
    expect(serialized).not.toContain('hidden notes');
    if (import.meta.env.DEV) {
      expect(infoSpy).toHaveBeenCalledWith('[TaskMint] task_changed', {
        taskId: '[REDACTED]',
        title: '[REDACTED]',
        notes: '[REDACTED]'
      });
    }
  });
});
