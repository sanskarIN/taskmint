import { describe, expect, it, vi } from 'vitest';
import { TaskMintError } from '../src/domain/errors';
import { logError } from '../src/utils/logger';

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
});
