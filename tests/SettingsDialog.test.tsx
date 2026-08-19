import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsDialog } from '../src/components/SettingsDialog';
import { strings } from '../src/i18n/en';
import { defaultSettings } from '../src/storage/repository';

function baseProps() {
  return {
    open: true,
    settings: defaultSettings,
    onClose: vi.fn(),
    onChange: vi.fn().mockResolvedValue(undefined),
    onExportJson: vi.fn(),
    onExportCsv: vi.fn(),
    onImportJson: vi.fn().mockResolvedValue(undefined),
    onImportCsv: vi.fn().mockResolvedValue(undefined),
    onDeleteAll: vi.fn().mockResolvedValue(undefined),
    onEnableNotifications: vi.fn().mockResolvedValue(undefined)
  };
}

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

describe('SettingsDialog', () => {
  it('shows a safe message when JSON export throws synchronously', async () => {
    const props = baseProps();
    props.onExportJson.mockImplementation(() => {
      throw new Error('browser export internals');
    });

    render(<SettingsDialog {...props} />);
    fireEvent.click(screen.getByRole('button', { name: strings.backupJson }));

    await vi.waitFor(() => expect(screen.getByRole('alert').textContent).toBe(strings.exportError));
    expect(screen.getByRole('alert').textContent).not.toContain('browser export internals');
  });

  it('serializes settings actions and keeps the dialog open while one is pending', async () => {
    const props = baseProps();
    let resolveChange: (() => void) | undefined;
    props.onChange.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveChange = resolve;
      })
    );

    render(<SettingsDialog {...props} />);
    fireEvent.change(screen.getByLabelText(strings.theme), { target: { value: 'dark' } });

    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog').getAttribute('aria-busy')).toBe('true');
    expect((screen.getByRole('button', { name: strings.closeSettings }) as HTMLButtonElement).disabled).toBe(
      true
    );

    fireEvent.click(screen.getByRole('button', { name: strings.enableBrowserNotifications }));
    expect(props.onEnableNotifications).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(props.onClose).not.toHaveBeenCalled();

    resolveChange?.();
    await vi.waitFor(() => {
      expect(screen.getByRole('dialog').getAttribute('aria-busy')).toBe('false');
    });
  });

  it('clears stale action errors after the dialog is closed and reopened', async () => {
    const props = baseProps();
    props.onChange.mockRejectedValueOnce(new Error('simulated settings failure'));
    const { rerender } = render(<SettingsDialog {...props} />);

    fireEvent.change(screen.getByLabelText(strings.theme), { target: { value: 'dark' } });
    await vi.waitFor(() => expect(screen.getByRole('alert').textContent).toBe(strings.settingsSaveError));

    rerender(<SettingsDialog {...props} open={false} />);
    rerender(<SettingsDialog {...props} open />);

    await vi.waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });
});
